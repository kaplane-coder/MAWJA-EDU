-- ==============================================================================
-- MAWJA EDUCATION — PHASE 02: DATABASE FUNCTIONS & TRIGGERS
-- Migration: 00002_functions_triggers.sql
-- Description: Creates reusable updated_at triggers, auth user profile creation,
--              automatic order number generator, and secure SECURITY DEFINER
--              administrative functions with strict audit logging.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. REUSABLE UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Attach updated_at triggers across all tables with updated_at columns
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_formateur_profiles_updated_at
    BEFORE UPDATE ON public.formateur_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_course_sections_updated_at
    BEFORE UPDATE ON public.course_sections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payment_requests_updated_at
    BEFORE UPDATE ON public.payment_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_enrollments_updated_at
    BEFORE UPDATE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 2. ORDER NUMBER GENERATION (Format: MAWJA-YYYY-XXXXXX)
-- ------------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number = 'MAWJA-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_orders_set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ------------------------------------------------------------------------------
-- 3. AUTOMATIC PROFILE CREATION ON AUTH.USERS REGISTRATION
-- ------------------------------------------------------------------------------
-- SECURITY RULE: Client registration MUST ALWAYS default to role 'STUDENT'.
-- Client metadata claiming elevated roles (ADMIN / FORMATEUR) is strictly ignored.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_full_name TEXT;
BEGIN
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone,
        avatar_url,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        v_full_name,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'avatar_url',
        'STUDENT'::user_role,
        true,
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = now();

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ------------------------------------------------------------------------------
-- 4. CONTROLLED ROLE MANAGEMENT (SECURITY DEFINER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION admin_set_user_role(
    target_user_id UUID,
    new_role user_role
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_caller_role user_role;
    v_prev_role user_role;
BEGIN
    v_caller_id := auth.uid();
    
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
    END IF;

    -- Verify caller is active ADMIN
    SELECT role INTO v_caller_role
    FROM public.profiles
    WHERE id = v_caller_id AND is_active = true;

    IF v_caller_role IS DISTINCT FROM 'ADMIN'::user_role THEN
        RAISE EXCEPTION 'Forbidden: Only administrators can modify user roles' USING ERRCODE = '42501';
    END IF;

    -- Prevent self-demotion
    IF target_user_id = v_caller_id THEN
        RAISE EXCEPTION 'Invalid operation: Administrators cannot modify their own role' USING ERRCODE = '22023';
    END IF;

    -- Verify target user exists
    SELECT role INTO v_prev_role
    FROM public.profiles
    WHERE id = target_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target user does not exist' USING ERRCODE = 'P0002';
    END IF;

    -- Update profile role
    UPDATE public.profiles
    SET role = new_role,
        updated_at = now()
    WHERE id = target_user_id;

    -- Auto-provision formateur_profiles if role changed to FORMATEUR
    IF new_role = 'FORMATEUR'::user_role THEN
        INSERT INTO public.formateur_profiles (id, created_at, updated_at)
        VALUES (target_user_id, now(), now())
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Write Audit Log
    INSERT INTO public.admin_audit_logs (
        actor_id,
        action,
        target_entity,
        target_id,
        details,
        created_at
    ) VALUES (
        v_caller_id,
        'SET_USER_ROLE',
        'profiles',
        target_user_id,
        jsonb_build_object(
            'previous_role', v_prev_role,
            'new_role', new_role
        ),
        now()
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. ADMIN PAYMENT APPROVAL (ATOMIC & SECURITY DEFINER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION admin_approve_payment(
    p_payment_proof_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_caller_role user_role;
    v_proof RECORD;
    v_request RECORD;
    v_order RECORD;
    v_item RECORD;
BEGIN
    v_caller_id := auth.uid();

    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
    END IF;

    -- Verify caller is active ADMIN
    SELECT role INTO v_caller_role
    FROM public.profiles
    WHERE id = v_caller_id AND is_active = true;

    IF v_caller_role IS DISTINCT FROM 'ADMIN'::user_role THEN
        RAISE EXCEPTION 'Forbidden: Only administrators can approve payments' USING ERRCODE = '42501';
    END IF;

    -- Locate payment proof (must be PENDING)
    SELECT * INTO v_proof
    FROM public.payment_proofs
    WHERE id = p_payment_proof_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment proof not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_proof.status != 'PENDING'::payment_proof_status THEN
        RAISE EXCEPTION 'Payment proof is not in PENDING status (current status: %)', v_proof.status USING ERRCODE = '22023';
    END IF;

    -- Locate associated payment request
    SELECT * INTO v_request
    FROM public.payment_requests
    WHERE id = v_proof.payment_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Associated payment request not found' USING ERRCODE = 'P0002';
    END IF;

    -- Locate associated order
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = v_request.order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Associated order not found' USING ERRCODE = 'P0002';
    END IF;

    -- 1. Update Payment Proof
    UPDATE public.payment_proofs
    SET status = 'APPROVED'::payment_proof_status,
        reviewed_by = v_caller_id,
        reviewed_at = now()
    WHERE id = p_payment_proof_id;

    -- 2. Update Payment Request
    UPDATE public.payment_requests
    SET status = 'APPROVED'::payment_request_status,
        updated_at = now()
    WHERE id = v_request.id;

    -- 3. Update Order
    UPDATE public.orders
    SET status = 'APPROVED'::order_status,
        updated_at = now()
    WHERE id = v_order.id;

    -- 4. Grant Enrollments for each course item in the order
    FOR v_item IN
        SELECT course_id FROM public.order_items WHERE order_id = v_order.id
    LOOP
        INSERT INTO public.enrollments (
            student_id,
            course_id,
            order_id,
            status,
            enrolled_at,
            updated_at
        ) VALUES (
            v_order.student_id,
            v_item.course_id,
            v_order.id,
            'ACTIVE'::enrollment_status,
            now(),
            now()
        )
        ON CONFLICT (student_id, course_id) DO UPDATE SET
            status = 'ACTIVE'::enrollment_status,
            order_id = EXCLUDED.order_id,
            updated_at = now();
    END LOOP;

    -- 5. Write Audit Log
    INSERT INTO public.admin_audit_logs (
        actor_id,
        action,
        target_entity,
        target_id,
        details,
        created_at
    ) VALUES (
        v_caller_id,
        'APPROVE_PAYMENT_PROOF',
        'payment_proofs',
        p_payment_proof_id,
        jsonb_build_object(
            'order_id', v_order.id,
            'order_number', v_order.order_number,
            'student_id', v_order.student_id,
            'payment_request_id', v_request.id,
            'amount', v_request.amount,
            'payment_method', v_request.payment_method
        ),
        now()
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. ADMIN PAYMENT REJECTION (ATOMIC & SECURITY DEFINER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION admin_reject_payment(
    p_payment_proof_id UUID,
    p_rejection_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_caller_role user_role;
    v_proof RECORD;
    v_request RECORD;
    v_order RECORD;
BEGIN
    v_caller_id := auth.uid();

    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
    END IF;

    IF p_rejection_reason IS NULL OR TRIM(p_rejection_reason) = '' THEN
        RAISE EXCEPTION 'Rejection reason is mandatory' USING ERRCODE = '22023';
    END IF;

    -- Verify caller is active ADMIN
    SELECT role INTO v_caller_role
    FROM public.profiles
    WHERE id = v_caller_id AND is_active = true;

    IF v_caller_role IS DISTINCT FROM 'ADMIN'::user_role THEN
        RAISE EXCEPTION 'Forbidden: Only administrators can reject payments' USING ERRCODE = '42501';
    END IF;

    -- Locate payment proof (must be PENDING)
    SELECT * INTO v_proof
    FROM public.payment_proofs
    WHERE id = p_payment_proof_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment proof not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_proof.status != 'PENDING'::payment_proof_status THEN
        RAISE EXCEPTION 'Payment proof is not in PENDING status (current status: %)', v_proof.status USING ERRCODE = '22023';
    END IF;

    -- Locate associated payment request
    SELECT * INTO v_request
    FROM public.payment_requests
    WHERE id = v_proof.payment_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Associated payment request not found' USING ERRCODE = 'P0002';
    END IF;

    -- Locate associated order
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = v_request.order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Associated order not found' USING ERRCODE = 'P0002';
    END IF;

    -- 1. Update Payment Proof with rejection reason
    UPDATE public.payment_proofs
    SET status = 'REJECTED'::payment_proof_status,
        rejection_reason = TRIM(p_rejection_reason),
        reviewed_by = v_caller_id,
        reviewed_at = now()
    WHERE id = p_payment_proof_id;

    -- 2. Update Payment Request
    UPDATE public.payment_requests
    SET status = 'REJECTED'::payment_request_status,
        updated_at = now()
    WHERE id = v_request.id;

    -- 3. Update Order
    UPDATE public.orders
    SET status = 'REJECTED'::order_status,
        updated_at = now()
    WHERE id = v_order.id;

    -- 4. Write Audit Log
    INSERT INTO public.admin_audit_logs (
        actor_id,
        action,
        target_entity,
        target_id,
        details,
        created_at
    ) VALUES (
        v_caller_id,
        'REJECT_PAYMENT_PROOF',
        'payment_proofs',
        p_payment_proof_id,
        jsonb_build_object(
            'order_id', v_order.id,
            'order_number', v_order.order_number,
            'student_id', v_order.student_id,
            'payment_request_id', v_request.id,
            'rejection_reason', TRIM(p_rejection_reason)
        ),
        now()
    );
END;
$$;
