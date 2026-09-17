-- ==============================================================================
-- MAWJA EDUCATION — PHASE 06: SECURITY HARDENING & PROGRESS DEFENSE
-- Migration: 00008_phase06_security_hardening.sql
-- Description: Hardens save_lesson_progress() with strict duration-capping and bounds,
--              attaches the set_updated_at() trigger to student_lesson_progress,
--              and introduces get_lesson_secure_content() for granular content protection.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HARDENED ATOMIC PROGRESS UPSERT FUNCTION (SECURITY DEFINER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.save_lesson_progress(
    p_lesson_id UUID,
    p_progress_seconds INTEGER,
    p_completed BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_student_id UUID;
    v_student_role user_role;
    v_course_id UUID;
    v_duration_seconds INTEGER;
    v_is_enrolled BOOLEAN;
    v_is_completed BOOLEAN;
    v_completed_at TIMESTAMPTZ;
    v_existing_progress RECORD;
    v_total_lessons INTEGER;
    v_completed_lessons INTEGER;
    v_capped_seconds INTEGER;
BEGIN
    -- 1. Strictly derive actor from auth.uid()
    v_student_id := auth.uid();

    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
    END IF;

    -- 2. Verify active profile and STUDENT role
    SELECT role INTO v_student_role
    FROM public.profiles
    WHERE id = v_student_id AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found or inactive' USING ERRCODE = 'P0002';
    END IF;

    -- Non-students (Formateurs previewing) cannot modify progress
    IF v_student_role != 'STUDENT'::public.user_role AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Forbidden: Only students can track lesson progress' USING ERRCODE = '42501';
    END IF;

    -- 3. Strict bounds check for progress_seconds input
    IF p_progress_seconds < 0 OR p_progress_seconds > 86400 THEN
        RAISE EXCEPTION 'Invalid progress_seconds: must be between 0 and 86400' USING ERRCODE = '22023';
    END IF;

    -- 4. Identify lesson, section, and course
    SELECT cs.course_id, COALESCE(l.duration_seconds, 0)
    INTO v_course_id, v_duration_seconds
    FROM public.lessons l
    JOIN public.course_sections cs ON cs.id = l.section_id
    WHERE l.id = p_lesson_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lesson not found' USING ERRCODE = 'P0002';
    END IF;

    -- 5. Verify active enrollment
    SELECT EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE student_id = v_student_id
          AND course_id = v_course_id
          AND status = 'ACTIVE'::public.enrollment_status
    ) INTO v_is_enrolled;

    IF NOT v_is_enrolled AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Forbidden: Active enrollment required' USING ERRCODE = '42501';
    END IF;

    -- 6. Cap progress_seconds against authoritative lesson duration
    IF v_duration_seconds > 0 THEN
        v_capped_seconds := LEAST(GREATEST(p_progress_seconds, 0), v_duration_seconds);
    ELSE
        v_capped_seconds := LEAST(GREATEST(p_progress_seconds, 0), 86400);
    END IF;

    -- 7. Check existing progress record
    SELECT * INTO v_existing_progress
    FROM public.student_lesson_progress
    WHERE student_id = v_student_id AND lesson_id = p_lesson_id;

    -- Completion logic:
    -- If explicitly completed, or previously completed, or watched >= 90% of duration
    IF p_completed 
       OR (FOUND AND v_existing_progress.completed)
       OR (v_duration_seconds > 0 AND v_capped_seconds >= (v_duration_seconds * 0.9)) THEN
        v_is_completed := true;
        v_completed_at := COALESCE(v_existing_progress.completed_at, now());
    ELSE
        v_is_completed := false;
        v_completed_at := NULL;
    END IF;

    -- 8. Idempotent progress upsert
    INSERT INTO public.student_lesson_progress (
        student_id,
        lesson_id,
        course_id,
        progress_seconds,
        completed,
        completed_at,
        last_watched_at,
        updated_at
    ) VALUES (
        v_student_id,
        p_lesson_id,
        v_course_id,
        v_capped_seconds,
        v_is_completed,
        v_completed_at,
        now(),
        now()
    )
    ON CONFLICT (student_id, lesson_id) DO UPDATE SET
        progress_seconds = GREATEST(EXCLUDED.progress_seconds, student_lesson_progress.progress_seconds),
        completed = CASE 
            WHEN student_lesson_progress.completed THEN true 
            ELSE EXCLUDED.completed 
        END,
        completed_at = COALESCE(student_lesson_progress.completed_at, EXCLUDED.completed_at),
        last_watched_at = now(),
        updated_at = now();

    -- 9. Calculate course-level stats
    SELECT COUNT(l.id) INTO v_total_lessons
    FROM public.lessons l
    JOIN public.course_sections cs ON cs.id = l.section_id
    WHERE cs.course_id = v_course_id;

    SELECT COUNT(id) INTO v_completed_lessons
    FROM public.student_lesson_progress
    WHERE student_id = v_student_id
      AND course_id = v_course_id
      AND completed = true;

    RETURN jsonb_build_object(
        'lesson_id', p_lesson_id,
        'course_id', v_course_id,
        'progress_seconds', v_capped_seconds,
        'completed', v_is_completed,
        'completed_at', v_completed_at,
        'total_lessons', v_total_lessons,
        'completed_lessons', v_completed_lessons,
        'progress_percentage', CASE 
            WHEN v_total_lessons > 0 THEN ROUND((v_completed_lessons::numeric / v_total_lessons::numeric) * 100) 
            ELSE 0 
        END
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. UPDATED_AT TRIGGER FOR STUDENT_LESSON_PROGRESS
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_student_lesson_progress_updated_at ON public.student_lesson_progress;

CREATE TRIGGER trg_student_lesson_progress_updated_at
    BEFORE UPDATE ON public.student_lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 3. SECURE PROTECTED LESSON CONTENT ACCESS FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_lesson_secure_content(
    p_lesson_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_is_enrolled BOOLEAN;
    v_lesson RECORD;
BEGIN
    v_user_id := auth.uid();

    -- Fetch lesson and parent course ownership details
    SELECT 
        l.id,
        l.section_id,
        l.title,
        l.content_type,
        l.video_path,
        l.article_content,
        l.duration_seconds,
        l.is_free_preview,
        l.order_index,
        cs.course_id,
        c.formateur_id,
        c.status AS course_status
    INTO v_lesson
    FROM public.lessons l
    JOIN public.course_sections cs ON cs.id = l.section_id
    JOIN public.courses c ON c.id = cs.course_id
    WHERE l.id = p_lesson_id;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Authorization Verification Pipeline:
    -- 1. Admin access
    IF public.is_admin() THEN
        RETURN jsonb_build_object(
            'id', v_lesson.id,
            'section_id', v_lesson.section_id,
            'title', v_lesson.title,
            'content_type', v_lesson.content_type,
            'video_path', v_lesson.video_path,
            'article_content', v_lesson.article_content,
            'duration_seconds', v_lesson.duration_seconds,
            'is_free_preview', v_lesson.is_free_preview,
            'order_index', v_lesson.order_index
        );
    END IF;

    -- 2. Formateur course owner access
    IF v_user_id IS NOT NULL AND v_lesson.formateur_id = v_user_id THEN
        RETURN jsonb_build_object(
            'id', v_lesson.id,
            'section_id', v_lesson.section_id,
            'title', v_lesson.title,
            'content_type', v_lesson.content_type,
            'video_path', v_lesson.video_path,
            'article_content', v_lesson.article_content,
            'duration_seconds', v_lesson.duration_seconds,
            'is_free_preview', v_lesson.is_free_preview,
            'order_index', v_lesson.order_index
        );
    END IF;

    -- 3. Actively enrolled student access
    IF v_user_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.enrollments
            WHERE student_id = v_user_id
              AND course_id = v_lesson.course_id
              AND status = 'ACTIVE'::public.enrollment_status
        ) INTO v_is_enrolled;

        IF v_is_enrolled THEN
            RETURN jsonb_build_object(
                'id', v_lesson.id,
                'section_id', v_lesson.section_id,
                'title', v_lesson.title,
                'content_type', v_lesson.content_type,
                'video_path', v_lesson.video_path,
                'article_content', v_lesson.article_content,
                'duration_seconds', v_lesson.duration_seconds,
                'is_free_preview', v_lesson.is_free_preview,
                'order_index', v_lesson.order_index
            );
        END IF;
    END IF;

    -- 4. Free Preview lesson in a PUBLISHED course
    IF v_lesson.is_free_preview AND v_lesson.course_status = 'PUBLISHED'::public.course_status THEN
        RETURN jsonb_build_object(
            'id', v_lesson.id,
            'section_id', v_lesson.section_id,
            'title', v_lesson.title,
            'content_type', v_lesson.content_type,
            'video_path', v_lesson.video_path,
            'article_content', v_lesson.article_content,
            'duration_seconds', v_lesson.duration_seconds,
            'is_free_preview', v_lesson.is_free_preview,
            'order_index', v_lesson.order_index
        );
    END IF;

    -- Access denied: return NULL
    RETURN NULL;
END;
$$;
