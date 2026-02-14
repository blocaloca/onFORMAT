-- Migration: 008_FIX_ADMIN_PERMISSIONS
-- Description: Adds missing columns to profiles and updates founder logic

-- 1. Add missing columns to profiles table if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS manual_pro_override BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_beta_user BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Update is_founder function to include davidcasteel@gmail.com
CREATE OR REPLACE FUNCTION is_founder(email TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email = 'casteelio@gmail.com' OR email = 'davidcasteel@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update Feedback Policies to use new founder logic via is_founder or hardcoded check
-- Drop existing policies to avoid conflicts/stale logic
DROP POLICY IF EXISTS "Admins view feedback" ON public.feedback_messages;
DROP POLICY IF EXISTS "Admins update feedback" ON public.feedback_messages;

-- Re-create policies using the updated is_founder check and is_admin column
CREATE POLICY "Admins view feedback" ON public.feedback_messages
FOR SELECT
USING (
  is_founder(auth.jwt() ->> 'email')
  OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

CREATE POLICY "Admins update feedback" ON public.feedback_messages
FOR UPDATE
USING (
  is_founder(auth.jwt() ->> 'email')
  OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

-- 4. Grant Admin/Founder status to David
UPDATE public.profiles 
SET is_admin = TRUE, manual_pro_override = TRUE 
WHERE email = 'davidcasteel@gmail.com';
