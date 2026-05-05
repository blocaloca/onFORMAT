-- Migration: Implement Real Storage Limits based on Subscription Tiers
-- Description: Adds RPCs to securely check storage usage against tier limits (5GB Scout, 50GB Pro, Unlimited Studio)

-- 1. Helper Function: Get User Storage Limit in Bytes
CREATE OR REPLACE FUNCTION get_user_storage_limit(user_uuid uuid)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tier text;
    is_founder boolean;
    manual_pro boolean;
BEGIN
    -- Check if founder or manual pro override
    SELECT email = 'casteelio@gmail.com' OR manual_pro_override = true INTO is_founder
    FROM public.profiles
    WHERE id = user_uuid;
    
    IF is_founder THEN
        RETURN 1099511627776; -- 1TB (effectively unlimited)
    END IF;

    -- Get highest active subscription tier
    SELECT s.tier INTO tier
    FROM public.subscriptions s
    WHERE s.user_id = user_uuid AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC LIMIT 1;

    -- Default to scout (5GB) if no active sub found
    IF tier IS NULL THEN
        tier := 'scout';
    END IF;

    -- Return limits based on tier marketing copy
    IF tier = 'pro' THEN
        RETURN 53687091200; -- 50GB
    ELSIF tier = 'studio' THEN
        RETURN 1099511627776; -- 1TB (Unlimited)
    ELSE
        RETURN 5368709120; -- 5GB (Scout/Free)
    END IF;
END;
$$;

-- 2. RPC: Check if an upload is allowed
CREATE OR REPLACE FUNCTION check_storage_status(file_size_bytes BIGINT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_usage BIGINT;
    limit_bytes BIGINT;
BEGIN
    -- Calculate total storage used by user across all files
    SELECT COALESCE(SUM(COALESCE((metadata->>'size')::BIGINT, 0)), 0)
    INTO current_usage
    FROM storage.objects
    WHERE owner = auth.uid();

    -- Get their specific tier limit
    limit_bytes := get_user_storage_limit(auth.uid());

    -- Check if the new file would push them over the limit
    IF (current_usage + file_size_bytes) > limit_bytes THEN
        RETURN json_build_object(
            'allowed', false,
            'current_usage', current_usage,
            'limit', limit_bytes,
            'reason', 'Storage limit exceeded. Please upgrade your plan to upload more assets.'
        );
    END IF;

    -- All good!
    RETURN json_build_object(
        'allowed', true,
        'current_usage', current_usage,
        'limit', limit_bytes
    );
END;
$$;

-- 3. (Optional but recommended) PostgreSQL Trigger to enforce this strictly at the DB level
--    This prevents bypassing the UI by calling the API directly.
CREATE OR REPLACE FUNCTION enforce_storage_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    status_check json;
    is_allowed boolean;
    reason text;
    file_size BIGINT;
BEGIN
    -- Only enforce on insert
    IF TG_OP = 'INSERT' THEN
        -- Get the size of the incoming file from metadata
        file_size := COALESCE((NEW.metadata->>'size')::BIGINT, 0);
        
        -- Run the exact same check we use on the frontend
        status_check := check_storage_status(file_size);
        
        is_allowed := (status_check->>'allowed')::boolean;
        reason := status_check->>'reason';
        
        IF NOT is_allowed THEN
            RAISE EXCEPTION '%', reason;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Drop trigger if exists to allow safe re-runs
DROP TRIGGER IF EXISTS ensure_storage_limits_trigger ON storage.objects;

-- Create the trigger on storage.objects
CREATE TRIGGER ensure_storage_limits_trigger
BEFORE INSERT ON storage.objects
FOR EACH ROW
EXECUTE FUNCTION enforce_storage_limits();
