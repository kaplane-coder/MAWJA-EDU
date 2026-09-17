-- ==============================================================================
-- MAWJA EDUCATION — PHASE 05: MANUAL PAYMENT ENGINE & ATOMIC FUNCTIONS
-- Migration: 00006_manual_payment_functions.sql
-- Description: Creates secure database functions for student order creation with
--              authoritative price snapshotting, duplicate order protection,
--              order cancellation, atomic payment proof submission, and idempotent
--              admin verification & enrollment unlocking.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. STUDENT CREATE MANUAL ORDER (AUTHORITATIVE PRICE SNAPSHOT)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION student_create_manual_order(
    p_course_id UUID,
    p_payment_method payment_method
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_caller_role user_role;
    v_course RECORD;
    v_existing_order RECORD;
    v_existing_enrollment RECORD;
    v_new_order_id UUID;
    v_new_order_number TEXT;
    v_payment_request_id UUID;
BEGIN
    v_caller_id := auth.uid();

    -- 1. Verify authentication
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
    END IF;

    -- 2. Verify caller profile & role
    SELECT role INTO v_caller_role
    FROM public.profiles
    WHERE id = v_caller_id AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found or inactive' USING ERRCODE = 'P0002';
    END IF;

    -- 3. Verify Course exists and is PUBLISHED
    SELECT id, title, price, status INTO v_course
    FROM public.courses
    WHERE id = p_course_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Course not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_course.status != 'PUBLISHED'::course_status THEN
        RAISE EXCEPTION 'Course is not available for purchase (status: %)', v_course.status USING ERRCODE = '22023';
    END IF;

    -- 4. Verify student is not already actively enrolled
    SELECT id, status INTO v_existing_enrollment
    FROM public.enrollments
    WHERE student_id = v_caller_id AND course_id = p_course_id;

    IF FOUND AND v_existing_enrollment.status = 'ACTIVE'::enrollment_status THEN
        RAISE EXCEPTION 'Student is already actively enrolled in this course' USING ERRCODE = '23505';
    END IF;

    -- 5. Detect existing active pending order for the same student & course (Duplicate protection)
    SELECT o.id, o.order_number, o.status, o.total_amount INTO v_existing_order
    FROM public.orders o
    JOIN public.order_items oi ON oi.order_id = o.id
    WHERE o.student_id = v_caller_id
      AND oi.course_id = p_course_id
      AND o.status IN ('PENDING_PAYMENT'::order_status, 'PROOF_SUBMITTED'::order_status)
    LIMIT 1;

    IF FOUND THEN
        -- Return existing order instead of creating an abusive duplicate
        RETURN jsonb_build_object(
            'order_id', v_existing_order.id,
            'order_number', v_existing_order.order_number,
            'amount', v_existing_order.total_amount,
            'status', v_existing_order.status,
            'is_existing', true
        );
    END IF;

    -- 6. Create Order with authoritative database price snapshot
    INSERT INTO public.orders (
        student_id,
        total_amount,
        status
    ) VALUES (
        v_caller_id,
        v_course.price,
        'PENDING_PAYMENT'::order_status
    )
    RETURNING id, order_number INTO v_new_order_id, v_new_order_number;

    -- 7. Create Order Item with authoritative unit price snapshot
    INSERT INTO public.order_items (
        order_id,
        course_id,
        unit_price
    ) VALUES (
        v_new_order_id,
        p_course_id,
        v_course.price
    );

    -- 8. Create Payment Request session
    INSERT INTO public.payment_requests (
        order_id,
        payment_method,
        amount,
        status
    ) VALUES (
        v_new_order_id,
        p_payment_method,
        v_course.price,
        'PENDING'::payment_request_status
    )
    RETURNING id INTO v_payment_request_id;

    -- 9. Return structured order creation confirmation
    RETURN jsonb_build_object(
        'order_id', v_new_order_id,
        'order_number', v_new_order_number,
        'payment_request_id', v_payment_request_id,
        'amount', v_course.price,
        'status', 'PENDING_PAYMENT',
        'is_existing', false
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. STUDENT CANCEL ORDER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION student_cancel_order(
    p_order_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_order RECORD;
BEGIN
    v_caller_id := auth.uid();

    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
    END IF;

    SELECT id, student_id, status INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_order.student_id != v_caller_id THEN
        RAISE EXCEPTION 'Forbidden: You do not own this order' USING ERRCODE = '42501';
    END IF;

    IF v_order.status != 'PENDING_PAYMENT'::order_status THEN
        RAISE EXCEPTION 'Cannot cancel order in status %', v_order.status USING ERRCODE = '22023';
    END IF;

    -- Update order to CANCELLED
    UPDATE public.orders
    SET status = 'CANCELLED'::order_status,
        updated_at = now()
    WHERE id = p_order_id;

    -- Update payment requests to CANCELLED
    UPDATE public.payment_requests
    SET status = 'CANCELLED'::payment_request_status,
        updated_at = now()
    WHERE order_id = p_order_id AND status = 'PENDING'::payment_request_status;
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. STUDENT SUBMIT PAYMENT PROOF
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION student_submit_payment_proof(
    p_order_id UUID,
    p_sender_name TEXT,
    p_sender_account_reference TEXT,
    p_transaction_reference TEXT,
    p_proof_storage_path TEXT,
    p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_order RECORD;
    v_request RECORD;
    v_proof_id UUID;
BEGIN
    v_caller_id := auth.uid();

    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
    END IF;

    IF p_sender_name IS NULL OR TRIM(p_sender_name) = '' THEN
        RAISE EXCEPTION 'Sender name is mandatory' USING ERRCODE = '22023';
    END IF;

    IF p_proof_storage_path IS NULL OR TRIM(p_proof_storage_path) = '' THEN
        RAISE EXCEPTION 'Proof storage path is mandatory' USING ERRCODE = '22023';
    END IF;

    -- 1. Locate and lock order
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_order.student_id != v_caller_id THEN
        RAISE EXCEPTION 'Forbidden: You do not own this order' USING ERRCODE = '42501';
    END IF;

    IF v_order.status NOT IN ('PENDING_PAYMENT'::order_status, 'REJECTED'::order_status) THEN
        RAISE EXCEPTION 'Cannot submit proof for order in status %', v_order.status USING ERRCODE = '22023';
    END IF;

    -- 2. Locate active payment request
    SELECT * INTO v_request
    FROM public.payment_requests
    WHERE order_id = p_order_id
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No payment request found for this order' USING ERRCODE = 'P0002';
    END IF;

    -- 3. Insert Payment Proof
    INSERT INTO public.payment_proofs (
        payment_request_id,
        sender_name,
        sender_account_reference,
        transaction_reference,
        proof_storage_path,
        notes,
        submitted_at,
        status
    ) VALUES (
        v_request.id,
        TRIM(p_sender_name),
        NULLIF(TRIM(p_sender_account_reference), ''),
        NULLIF(TRIM(p_transaction_reference), ''),
        TRIM(p_proof_storage_path),
        NULLIF(TRIM(p_notes), ''),
        now(),
        'PENDING'::payment_proof_status
    )
    RETURNING id INTO v_proof_id;

    -- 4. Update Payment Request status
    UPDATE public.payment_requests
    SET status = 'PROOF_SUBMITTED'::payment_request_status,
        updated_at = now()
    WHERE id = v_request.id;

    -- 5. Update Order status
    UPDATE public.orders
    SET status = 'PROOF_SUBMITTED'::order_status,
        updated_at = now()
    WHERE id = v_order.id;

    RETURN jsonb_build_object(
        'proof_id', v_proof_id,
        'order_id', v_order.id,
        'status', 'PROOF_SUBMITTED'
    );
END;
$$;
