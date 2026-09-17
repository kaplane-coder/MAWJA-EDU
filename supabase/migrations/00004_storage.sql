-- ==============================================================================
-- MAWJA EDUCATION — PHASE 02: STORAGE BUCKETS & SECURITY POLICIES
-- Migration: 00004_storage.sql
-- Description: Provisions the 3 core Supabase Storage buckets with strict access
--              control policies for public assets and protected private content.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROVISION STORAGE BUCKETS
-- ------------------------------------------------------------------------------

-- Public Assets: Course thumbnails, user avatars, platform badges
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'public-assets',
    'public-assets',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Private Proofs: Offline transfer receipts & payment proofs (STRICTLY PRIVATE)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'private-proofs',
    'private-proofs',
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Course Materials: Protected videos, files, downloadable assets (STRICTLY PRIVATE)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'course-materials',
    'course-materials',
    false,
    524288000, -- 500MB limit
    ARRAY[
        'video/mp4', 'video/webm', 'application/pdf', 
        'application/zip', 'application/x-zip-compressed',
        'application/json', 'text/plain'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ------------------------------------------------------------------------------
-- 2. STORAGE ACCESS CONTROL POLICIES (storage.objects)
-- ------------------------------------------------------------------------------

-- ==============================================================================
-- 2.1 public-assets Bucket Policies
-- ==============================================================================

-- Anyone (including unauthenticated guests) can view public assets
CREATE POLICY "public_assets_select_policy" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'public-assets');

-- Authenticated users can upload avatars and course media
CREATE POLICY "public_assets_insert_policy" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'public-assets'
        AND auth.role() = 'authenticated'
        AND (
            -- Avatar uploads under user's own directory
            (name LIKE 'avatars/' || auth.uid() || '/%')
            -- Formateur course thumbnail uploads
            OR (public.is_formateur() AND name LIKE 'courses/%')
            -- Admin uploads
            OR public.is_admin()
        )
    );

CREATE POLICY "public_assets_update_delete_policy" ON storage.objects
    FOR ALL
    USING (
        bucket_id = 'public-assets'
        AND (
            (name LIKE 'avatars/' || auth.uid() || '/%')
            OR public.is_admin()
        )
    );

-- ==============================================================================
-- 2.2 private-proofs Bucket Policies (ZERO PUBLIC ACCESS)
-- Path format: {user_id}/{order_id}/{file_name}
-- ==============================================================================

-- Only the student who uploaded the proof or an ADMIN can view/download receipt
CREATE POLICY "private_proofs_select_policy" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'private-proofs'
        AND (
            (name LIKE auth.uid() || '/%')
            OR public.is_admin()
        )
    );

-- Student can upload proof to their own user directory
CREATE POLICY "private_proofs_insert_policy" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'private-proofs'
        AND auth.role() = 'authenticated'
        AND (
            (name LIKE auth.uid() || '/%')
            OR public.is_admin()
        )
    );

-- Normal users CANNOT modify or delete receipts once uploaded (immutability)
CREATE POLICY "private_proofs_admin_manage_policy" ON storage.objects
    FOR ALL
    USING (
        bucket_id = 'private-proofs'
        AND public.is_admin()
    );

-- ==============================================================================
-- 2.3 course-materials Bucket Policies (PROTECTED MATERIAL)
-- Path format: {formateur_id}/{course_id}/{file_name}
-- ==============================================================================

-- Formateur owner, actively enrolled students, and Admins can view/download materials
CREATE POLICY "course_materials_select_policy" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'course-materials'
        AND (
            -- Formateur who uploaded the material
            (name LIKE auth.uid() || '/%')
            -- Enrolled student (derives course_id from path prefix: {formateur_id}/{course_id}/...)
            OR (
                auth.role() = 'authenticated'
                AND EXISTS (
                    SELECT 1 FROM public.enrollments
                    WHERE enrollments.student_id = auth.uid()
                      AND enrollments.status = 'ACTIVE'::public.enrollment_status
                      AND enrollments.course_id::text = (storage.foldername(name))[2]
                )
            )
            -- Platform Administrator
            OR public.is_admin()
        )
    );

-- Formateur can upload to their own course directories
CREATE POLICY "course_materials_insert_policy" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'course-materials'
        AND auth.role() = 'authenticated'
        AND (
            (public.is_formateur() AND name LIKE auth.uid() || '/%')
            OR public.is_admin()
        )
    );

-- Formateur can manage/delete materials in their own directories
CREATE POLICY "course_materials_manage_policy" ON storage.objects
    FOR ALL
    USING (
        bucket_id = 'course-materials'
        AND (
            (name LIKE auth.uid() || '/%')
            OR public.is_admin()
        )
    );
