-- ==============================================================================
-- MAWJA EDUCATION — PHASE 07: PROFILES & ROLE DASHBOARDS SCHEMA ENHANCEMENT
-- Migration: 00009_phase07_profiles_dashboards.sql
-- Description: Adds profile metadata columns, user active-status toggle RPC,
--              formateur verification toggle RPC, and optimized dashboard indexes.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ADDITIVE COLUMNS TO PUBLIC.PROFILES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS wilaya TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'ar',
    ADD COLUMN IF NOT EXISTS headline TEXT,
    ADD COLUMN IF NOT EXISTS specialization TEXT,
    ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Performance and lookup indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- ------------------------------------------------------------------------------
-- 2. HARDENED PROFILE UPDATE RLS POLICY
-- ------------------------------------------------------------------------------
-- Ensure users can update their profile fields while strictly locking role, id, is_active
DROP POLICY IF EXISTS "profiles_update_own_policy" ON public.profiles;

CREATE POLICY "profiles_update_own_policy" ON public.profiles
    FOR UPDATE
    USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (
        (
            id = auth.uid() 
            AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
            AND is_active = (SELECT is_active FROM public.profiles WHERE id = auth.uid())
        )
        OR public.is_admin()
    );

-- ------------------------------------------------------------------------------
-- 3. ADMIN USER ACTIVE STATUS TOGGLE (SECURITY DEFINER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION admin_toggle_user_active(
    target_user_id UUID,
    new_is_active BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_caller_role user_role;
    v_prev_active BOOLEAN;
    v_target_email TEXT;
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
        RAISE EXCEPTION 'Forbidden: Only administrators can change user active status' USING ERRCODE = '42501';
    END IF;

    -- Prevent admin self-deactivation
    IF target_user_id = v_caller_id AND new_is_active = false THEN
        RAISE EXCEPTION 'Invalid operation: Administrators cannot deactivate their own account' USING ERRCODE = '22023';
    END IF;

    -- Verify target user exists
    SELECT is_active, email INTO v_prev_active, v_target_email
    FROM public.profiles
    WHERE id = target_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target user does not exist' USING ERRCODE = 'P0002';
    END IF;

    -- Update is_active
    UPDATE public.profiles
    SET is_active = new_is_active,
        updated_at = now()
    WHERE id = target_user_id;

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
        CASE WHEN new_is_active THEN 'USER_ACTIVATED' ELSE 'USER_DEACTIVATED' END,
        'profiles',
        target_user_id,
        jsonb_build_object(
            'target_email', v_target_email,
            'previous_is_active', v_prev_active,
            'new_is_active', new_is_active
        ),
        now()
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. ADMIN FORMATEUR VERIFICATION TOGGLE (SECURITY DEFINER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION admin_toggle_formateur_verified(
    target_user_id UUID,
    new_is_verified BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_caller_role user_role;
    v_prev_verified BOOLEAN;
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
        RAISE EXCEPTION 'Forbidden: Only administrators can verify formateurs' USING ERRCODE = '42501';
    END IF;

    -- Ensure formateur profile exists
    SELECT is_verified INTO v_prev_verified
    FROM public.formateur_profiles
    WHERE id = target_user_id;

    IF NOT FOUND THEN
        -- Insert formateur profile if not exists
        INSERT INTO public.formateur_profiles (id, is_verified, created_at, updated_at)
        VALUES (target_user_id, new_is_verified, now(), now());
        v_prev_verified := false;
    ELSE
        UPDATE public.formateur_profiles
        SET is_verified = new_is_verified,
            updated_at = now()
        WHERE id = target_user_id;
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
        CASE WHEN new_is_verified THEN 'FORMATEUR_VERIFIED' ELSE 'FORMATEUR_UNVERIFIED' END,
        'formateur_profiles',
        target_user_id,
        jsonb_build_object(
            'previous_is_verified', v_prev_verified,
            'new_is_verified', new_is_verified
        ),
        now()
    );
END;
$$;
