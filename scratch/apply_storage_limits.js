const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
    const sql = `
-- Function to get user's storage limit in bytes based on subscription
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
    -- Check if founder or admin
    SELECT email = 'casteelio@gmail.com' OR manual_pro_override = true INTO is_founder
    FROM public.profiles
    WHERE id = user_uuid;
    
    IF is_founder THEN
        RETURN 1099511627776; -- 1TB (effectively unlimited for our purposes)
    END IF;

    -- Get subscription tier
    SELECT s.tier INTO tier
    FROM public.subscriptions s
    WHERE s.user_id = user_uuid AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC LIMIT 1;

    -- If no active sub, default to free/scout tier
    IF tier IS NULL THEN
        tier := 'scout';
    END IF;

    -- Return limits based on tier
    IF tier = 'pro' THEN
        RETURN 53687091200; -- 50GB
    ELSIF tier = 'studio' THEN
        RETURN 1099511627776; -- 1TB (Unlimited)
    ELSE
        RETURN 5368709120; -- 5GB (Scout/Free)
    END IF;
END;
$$;

-- RPC for client to check usage vs limit securely
CREATE OR REPLACE FUNCTION check_storage_status(file_size_bytes BIGINT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_usage BIGINT;
    limit_bytes BIGINT;
BEGIN
    -- Get current total storage used by the user across all buckets
    SELECT COALESCE(SUM(COALESCE((metadata->>'size')::BIGINT, 0)), 0)
    INTO current_usage
    FROM storage.objects
    WHERE owner = auth.uid();

    -- Get limit
    limit_bytes := get_user_storage_limit(auth.uid());

    IF (current_usage + file_size_bytes) > limit_bytes THEN
        RETURN json_build_object(
            'allowed', false,
            'current_usage', current_usage,
            'limit', limit_bytes,
            'reason', 'Storage limit exceeded. Please upgrade your plan.'
        );
    END IF;

    RETURN json_build_object(
        'allowed', true,
        'current_usage', current_usage,
        'limit', limit_bytes
    );
END;
$$;
`;

    // Because supabase-js doesn't have a direct .query method, we can execute this by creating a quick RPC 'exec_sql'
    // Oh wait, if exec_sql doesn't exist, we can't run raw SQL. 
    console.log("We need to run this SQL in Supabase SQL editor");
}

run();
