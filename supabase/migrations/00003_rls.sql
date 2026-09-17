-- ==============================================================================
-- MAWJA EDUCATION — PHASE 02: ROW LEVEL SECURITY (ZERO TRUST POLICIES)
-- Migration: 00003_rls.sql
-- Description: Enforces Row Level Security (RLS) across all application tables.
--              Defines fine-grained policies for STUDENT, FORMATEUR, ADMIN, and ANONYMOUS.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HELPER SECURITY FUNCTIONS
-- ------------------------------------------------------------------------------

-- Get current authenticated user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() AND is_active = true;
$$;

-- Check if current authenticated user is an active ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'ADMIN'::user_role AND is_active = true
    );
$$;

-- Check if current authenticated user is an active FORMATEUR
CREATE OR REPLACE FUNCTION public.is_formateur()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'FORMATEUR'::user_role AND is_active = true
    );
$$;

-- Check if current authenticated user has an active enrollment in a course
CREATE OR REPLACE FUNCTION public.is_enrolled_in_course(p_course_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.enrollments 
        WHERE student_id = auth.uid() 
          AND course_id = p_course_id 
          AND status = 'ACTIVE'::enrollment_status
    );
$$;

-- ------------------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formateur_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. PROFILES POLICIES
-- ------------------------------------------------------------------------------

-- Public read for active profiles (instructor bios, avatars) & own profile
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT
    USING (
        is_active = true 
        OR id = auth.uid() 
        OR public.is_admin()
    );

-- Users can update only their own profile details (role & is_active changes are rejected)
CREATE POLICY "profiles_update_own_policy" ON public.profiles
    FOR UPDATE
    USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (
        (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
        OR public.is_admin()
    );

-- ------------------------------------------------------------------------------
-- 4. FORMATEUR PROFILES POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "formateur_profiles_select_policy" ON public.formateur_profiles
    FOR SELECT
    USING (
        is_verified = true 
        OR id = auth.uid() 
        OR public.is_admin()
    );

-- Formateur can edit own bio, headline, social_links (commission_rate and is_verified locked)
CREATE POLICY "formateur_profiles_update_own_policy" ON public.formateur_profiles
    FOR UPDATE
    USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (
        (
            id = auth.uid() 
            AND commission_rate = (SELECT commission_rate FROM public.formateur_profiles WHERE id = auth.uid())
            AND is_verified = (SELECT is_verified FROM public.formateur_profiles WHERE id = auth.uid())
        )
        OR public.is_admin()
    );

CREATE POLICY "formateur_profiles_admin_all" ON public.formateur_profiles
    FOR ALL
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. COURSES POLICIES
-- ------------------------------------------------------------------------------

-- Anyone can browse published courses. Formateurs can see their own. Admins see all.
CREATE POLICY "courses_select_policy" ON public.courses
    FOR SELECT
    USING (
        status = 'PUBLISHED'::course_status
        OR formateur_id = auth.uid()
        OR public.is_admin()
    );

-- Formateurs can insert courses assigned to themselves.
CREATE POLICY "courses_insert_formateur_policy" ON public.courses
    FOR INSERT
    WITH CHECK (
        (public.is_formateur() AND formateur_id = auth.uid())
        OR public.is_admin()
    );

-- Formateurs can update only their own courses. Admins can update any.
CREATE POLICY "courses_update_formateur_policy" ON public.courses
    FOR UPDATE
    USING (formateur_id = auth.uid() OR public.is_admin())
    WITH CHECK (formateur_id = auth.uid() OR public.is_admin());

-- Formateurs can delete only their own draft/archived courses. Admins can delete any.
CREATE POLICY "courses_delete_formateur_policy" ON public.courses
    FOR DELETE
    USING (
        (formateur_id = auth.uid() AND status IN ('DRAFT'::course_status, 'ARCHIVED'::course_status))
        OR public.is_admin()
    );

-- ------------------------------------------------------------------------------
-- 6. COURSE SECTIONS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "course_sections_select_policy" ON public.course_sections
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = course_sections.course_id 
              AND (courses.status = 'PUBLISHED'::course_status OR courses.formateur_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "course_sections_insert_policy" ON public.course_sections
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = course_sections.course_id 
              AND (courses.formateur_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "course_sections_update_policy" ON public.course_sections
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = course_sections.course_id 
              AND (courses.formateur_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "course_sections_delete_policy" ON public.course_sections
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = course_sections.course_id 
              AND (courses.formateur_id = auth.uid() OR public.is_admin())
        )
    );

-- ------------------------------------------------------------------------------
-- 7. LESSONS POLICIES
-- ------------------------------------------------------------------------------

-- Public/Student can see lesson metadata for published courses or enrolled courses
CREATE POLICY "lessons_select_policy" ON public.lessons
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.course_sections
            JOIN public.courses ON courses.id = course_sections.course_id
            WHERE course_sections.id = lessons.section_id
              AND (
                  courses.status = 'PUBLISHED'::course_status
                  OR courses.formateur_id = auth.uid()
                  OR public.is_admin()
              )
        )
    );

CREATE POLICY "lessons_insert_policy" ON public.lessons
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.course_sections
            JOIN public.courses ON courses.id = course_sections.course_id
            WHERE course_sections.id = lessons.section_id
              AND (courses.formateur_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "lessons_update_policy" ON public.lessons
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.course_sections
            JOIN public.courses ON courses.id = course_sections.course_id
            WHERE course_sections.id = lessons.section_id
              AND (courses.formateur_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "lessons_delete_policy" ON public.lessons
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.course_sections
            JOIN public.courses ON courses.id = course_sections.course_id
            WHERE course_sections.id = lessons.section_id
              AND (courses.formateur_id = auth.uid() OR public.is_admin())
        )
    );

-- ------------------------------------------------------------------------------
-- 8. ORDERS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "orders_select_policy" ON public.orders
    FOR SELECT
    USING (
        student_id = auth.uid() 
        OR public.is_admin()
    );

CREATE POLICY "orders_insert_policy" ON public.orders
    FOR INSERT
    WITH CHECK (
        student_id = auth.uid()
        AND status = 'PENDING_PAYMENT'::order_status
    );

CREATE POLICY "orders_admin_policy" ON public.orders
    FOR ALL
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9. ORDER ITEMS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "order_items_select_policy" ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
              AND (orders.student_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "order_items_insert_policy" ON public.order_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
              AND orders.student_id = auth.uid()
              AND orders.status = 'PENDING_PAYMENT'::order_status
        )
        OR public.is_admin()
    );

CREATE POLICY "order_items_admin_policy" ON public.order_items
    FOR ALL
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 10. PAYMENT REQUESTS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "payment_requests_select_policy" ON public.payment_requests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = payment_requests.order_id 
              AND (orders.student_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "payment_requests_insert_policy" ON public.payment_requests
    FOR INSERT
    WITH CHECK (
        (
            EXISTS (
                SELECT 1 FROM public.orders 
                WHERE orders.id = payment_requests.order_id 
                  AND orders.student_id = auth.uid()
                  AND orders.status = 'PENDING_PAYMENT'::order_status
            )
            AND status = 'PENDING'::payment_request_status
        )
        OR public.is_admin()
    );

CREATE POLICY "payment_requests_admin_policy" ON public.payment_requests
    FOR ALL
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 11. PAYMENT PROOFS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "payment_proofs_select_policy" ON public.payment_proofs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.payment_requests
            JOIN public.orders ON orders.id = payment_requests.order_id
            WHERE payment_requests.id = payment_proofs.payment_request_id
              AND (orders.student_id = auth.uid() OR public.is_admin())
        )
    );

-- Student can upload proof only for their own request, with PENDING status and empty review fields
CREATE POLICY "payment_proofs_insert_policy" ON public.payment_proofs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.payment_requests
            JOIN public.orders ON orders.id = payment_requests.order_id
            WHERE payment_requests.id = payment_proofs.payment_request_id
              AND orders.student_id = auth.uid()
        )
        AND status = 'PENDING'::payment_proof_status
        AND reviewed_by IS NULL
        AND reviewed_at IS NULL
    );

CREATE POLICY "payment_proofs_admin_policy" ON public.payment_proofs
    FOR ALL
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 12. ENROLLMENTS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "enrollments_select_policy" ON public.enrollments
    FOR SELECT
    USING (
        student_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = enrollments.course_id 
              AND courses.formateur_id = auth.uid()
        )
        OR public.is_admin()
    );

-- Normal users cannot insert/update enrollments directly; only ADMIN or SECURITY DEFINER functions can.
CREATE POLICY "enrollments_admin_policy" ON public.enrollments
    FOR ALL
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 13. ADMIN AUDIT LOGS POLICIES
-- ------------------------------------------------------------------------------

-- Append-only audit table: Normal users have zero access. Admins can read.
CREATE POLICY "admin_audit_logs_select_policy" ON public.admin_audit_logs
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "admin_audit_logs_insert_admin_policy" ON public.admin_audit_logs
    FOR INSERT
    WITH CHECK (public.is_admin());
