-- EMERGENCY DATA RECOVERY
-- This script re-assigns ALL projects to the user with email 'casteelio@gmail.com'
-- ONLY Run this if you are the sole user and want to reclaim all data.

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 1. Get the Founder's User ID
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'casteelio@gmail.com';

    IF target_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found Founder ID: %', target_user_id;

        -- 2. Update All Projects to belong to this user
        -- (Ideally, we only update ones that are 'lost', but to be sure, we grab all for now)
        UPDATE projects 
        SET user_id = target_user_id
        WHERE user_id != target_user_id OR user_id IS NULL;

        RAISE NOTICE 'Updated projects to belong to Founder.';
    ELSE
        RAISE NOTICE 'Founder email not found in auth.users.';
    END IF;
END $$;
