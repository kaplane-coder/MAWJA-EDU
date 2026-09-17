-- ==============================================================================
-- MAWJA EDUCATION — PHASE 06: STUDENT LESSON PROGRESS & CLASSROOM SYSTEM
-- Migration: 00007_student_lesson_progress.sql
-- Description: Creates the student_lesson_progress table, strict RLS policies,
--              performance indexes, and atomic progress tracking functions.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. STUDENT LESSON PROGRESS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    progress_seconds INTEGER NOT NULL DEFAULT 0 CHECK (progress_seconds >= 0),
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    last_watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_lesson_progress UNIQUE (student_id, lesson_id)
);

-- Indexes for lightning fast classroom lookups and last-watched queries
CREATE INDEX IF NOT EXISTS idx_student_progress_student_course 
    ON public.student_lesson_progress(student_id, course_id);

CREATE INDEX IF NOT EXISTS idx_student_progress_student_lesson 
    ON public.student_lesson_progress(student_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_student_progress_last_watched 
    ON public.student_lesson_progress(student_id, last_watched_at DESC);

-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) FOR PROGRESS
-- ------------------------------------------------------------------------------
ALTER TABLE public.student_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Students can read only their own progress. Admins can read all.
CREATE POLICY "student_lesson_progress_select_policy" ON public.student_lesson_progress
    FOR SELECT
    USING (
        student_id = auth.uid()
        OR public.is_admin()
    );

-- Students can insert progress ONLY for courses they are ACTIVELY enrolled in
CREATE POLICY "student_lesson_progress_insert_policy" ON public.student_lesson_progress
    FOR INSERT
    WITH CHECK (
        student_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.enrollments
            WHERE enrollments.student_id = auth.uid()
              AND enrollments.course_id = student_lesson_progress.course_id
              AND enrollments.status = 'ACTIVE'::public.enrollment_status
        )
    );

-- Students can update ONLY their own progress records
CREATE POLICY "student_lesson_progress_update_policy" ON public.student_lesson_progress
    FOR UPDATE
    USING (
        student_id = auth.uid()
        OR public.is_admin()
    )
    WITH CHECK (
        student_id = auth.uid()
        OR public.is_admin()
    );

-- Formateurs have ZERO write access to student progress. Admins have full management.
CREATE POLICY "student_lesson_progress_admin_policy" ON public.student_lesson_progress
    FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. ATOMIC PROGRESS UPSERT FUNCTION (SECURITY DEFINER)
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
    v_course_id UUID;
    v_duration_seconds INTEGER;
    v_is_enrolled BOOLEAN;
    v_is_completed BOOLEAN;
    v_completed_at TIMESTAMPTZ;
    v_existing_progress RECORD;
    v_total_lessons INTEGER;
    v_completed_lessons INTEGER;
BEGIN
    v_student_id := auth.uid();

    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
    END IF;

    -- 1. Identify lesson, section, and course
    SELECT cs.course_id, l.duration_seconds
    INTO v_course_id, v_duration_seconds
    FROM public.lessons l
    JOIN public.course_sections cs ON cs.id = l.section_id
    WHERE l.id = p_lesson_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lesson not found' USING ERRCODE = 'P0002';
    END IF;

    -- 2. Verify active enrollment
    SELECT EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE student_id = v_student_id
          AND course_id = v_course_id
          AND status = 'ACTIVE'::public.enrollment_status
    ) INTO v_is_enrolled;

    IF NOT v_is_enrolled AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Forbidden: Active enrollment required' USING ERRCODE = '42501';
    END IF;

    -- 3. Check existing progress
    SELECT * INTO v_existing_progress
    FROM public.student_lesson_progress
    WHERE student_id = v_student_id AND lesson_id = p_lesson_id;

    -- Auto-completion logic:
    -- If requested completed, or previously completed, or watched >= 90% of duration
    IF p_completed 
       OR (FOUND AND v_existing_progress.completed)
       OR (v_duration_seconds > 0 AND p_progress_seconds >= (v_duration_seconds * 0.9)) THEN
        v_is_completed := true;
        v_completed_at := COALESCE(v_existing_progress.completed_at, now());
    ELSE
        v_is_completed := false;
        v_completed_at := NULL;
    END IF;

    -- 4. Upsert progress row
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
        GREATEST(p_progress_seconds, 0),
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

    -- 5. Calculate course-level stats
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
        'progress_seconds', GREATEST(p_progress_seconds, 0),
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
