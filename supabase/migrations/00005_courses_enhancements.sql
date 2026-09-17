-- ==============================================================================
-- MAWJA EDUCATION — PHASE 04: COURSES & CURRICULUM ENHANCEMENTS
-- Migration: 00005_courses_enhancements.sql
-- Description: Adds short_description, category, and rejection_reason columns
--              to public.courses to support rich catalog discovery and admin review.
-- ==============================================================================

ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS short_description TEXT,
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
