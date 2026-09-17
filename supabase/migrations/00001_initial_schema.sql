-- ==============================================================================
-- MAWJA EDUCATION — PHASE 02: DATABASE SCHEMA & CORE TYPES
-- Migration: 00001_initial_schema.sql
-- Description: Creates all domain enums, core tables, relationships, constraints,
--              and performance indexes for the MAWJA platform.
-- ==============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. DATABASE ENUMS
-- ------------------------------------------------------------------------------

-- User Roles
CREATE TYPE user_role AS ENUM (
    'STUDENT',
    'FORMATEUR',
    'ADMIN'
);

-- Course Complexity Levels
CREATE TYPE course_level AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED',
    'ALL_LEVELS'
);

-- Course Lifecycle Statuses
CREATE TYPE course_status AS ENUM (
    'DRAFT',
    'PENDING_REVIEW',
    'PUBLISHED',
    'ARCHIVED'
);

-- Lesson Content Types
CREATE TYPE lesson_content_type AS ENUM (
    'VIDEO',
    'ARTICLE',
    'QUIZ',
    'ATTACHMENT'
);

-- Order Lifecycle Statuses
CREATE TYPE order_status AS ENUM (
    'PENDING_PAYMENT',
    'PROOF_SUBMITTED',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);

-- Algerian Payment Method Types (V1 Offline/Manual Transfer Architecture)
CREATE TYPE payment_method AS ENUM (
    'BARIDIMOB',
    'CCP',
    'BANK_TRANSFER',
    'CASH'
);

-- Payment Request Statuses
CREATE TYPE payment_request_status AS ENUM (
    'PENDING',
    'PROOF_SUBMITTED',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);

-- Payment Proof Review Statuses
CREATE TYPE payment_proof_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

-- Enrollment Statuses
CREATE TYPE enrollment_status AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'COMPLETED'
);

-- ------------------------------------------------------------------------------
-- 2. CORE TABLES & CONSTRAINTS
-- ------------------------------------------------------------------------------

-- 2.1 Profiles (Public representation of auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'STUDENT',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 Formateur Profiles (Extended instructor metadata)
CREATE TABLE formateur_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio TEXT,
    headline TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formateur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    thumbnail_path TEXT,
    preview_video_path TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    level course_level NOT NULL,
    status course_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 Course Sections (Structured curriculum chapters)
CREATE TABLE course_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL CHECK (order_index >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_course_sections_course_order UNIQUE (course_id, order_index)
);

-- 2.5 Lessons
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type lesson_content_type NOT NULL,
    video_path TEXT,
    article_content TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    is_free_preview BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL CHECK (order_index >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_lessons_section_order UNIQUE (section_id, order_index)
);

-- 2.6 Orders (Multi-course checkout headers)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    status order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.7 Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_order_items_order_course UNIQUE (order_id, course_id)
);

-- 2.8 Payment Requests (Payment attempt sessions)
CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method payment_method NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    status payment_request_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.9 Payment Proofs (Manual transfer receipt submissions)
-- NOTE: Multiple proof submissions per request/order are permitted to support retry after rejection.
CREATE TABLE payment_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_request_id UUID NOT NULL REFERENCES public.payment_requests(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_account_reference TEXT,
    transaction_reference TEXT,
    proof_storage_path TEXT NOT NULL,
    file_hash TEXT,
    notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    status payment_proof_status NOT NULL DEFAULT 'PENDING'
);

-- 2.10 Enrollments (Granted course access permissions)
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    status enrollment_status NOT NULL DEFAULT 'ACTIVE',
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_enrollments_student_course UNIQUE (student_id, course_id)
);

-- 2.11 Admin Audit Logs (Append-only security audit trail)
CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. PERFORMANCE & INTEGRITY INDEXES
-- ------------------------------------------------------------------------------

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_courses_formateur_id ON public.courses(formateur_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_course_sections_course_id ON public.course_sections(course_id);
CREATE INDEX idx_lessons_section_id ON public.lessons(section_id);
CREATE INDEX idx_orders_student_id ON public.orders(student_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_course_id ON public.order_items(course_id);
CREATE INDEX idx_payment_requests_order_id ON public.payment_requests(order_id);
CREATE INDEX idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX idx_payment_proofs_payment_request_id ON public.payment_proofs(payment_request_id);
CREATE INDEX idx_payment_proofs_transaction_reference ON public.payment_proofs(transaction_reference);
CREATE INDEX idx_payment_proofs_file_hash ON public.payment_proofs(file_hash);
CREATE INDEX idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX idx_admin_audit_logs_actor_id ON public.admin_audit_logs(actor_id);
CREATE INDEX idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at);
