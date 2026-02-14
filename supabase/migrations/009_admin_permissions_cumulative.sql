-- Migration: 009_ADMIN_PERMISSIONS_CUMULATIVE
-- Description: Ensures Feedback Table exists AND Admin Permissions are fixed.
-- Combines logic from 006 and 008 to resolve "relation does not exist" errors.

-- 1. Ensure 'feedback_messages' table exists
CREATE TABLE IF NOT EXISTS public.feedback_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'other')),
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on feedback_messages (idempotent)
ALTER TABLE public.feedback_messages ENABLE ROW LEVEL SECURITY;

-- 2. Add missing columns to profiles table if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS manual_pro_override BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_beta_user BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 3. Update is_founder function to include casteelio@gmail.com only
CREATE OR REPLACE FUNCTION is_founder(email TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email = 'casteelio@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-Apply Policies (Drop first to ensure clean state)

-- Drop existing policies for Feedback
DROP POLICY IF EXISTS "Users can submit feedback" ON public.feedback_messages;
DROP POLICY IF EXISTS "Admins view feedback" ON public.feedback_messages;
DROP POLICY IF EXISTS "Admins update feedback" ON public.feedback_messages;

-- Create Policies

-- Allow Users to Insert
CREATE POLICY "Users can submit feedback" ON public.feedback_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow Admins/Founders to View
CREATE POLICY "Admins view feedback" ON public.feedback_messages
FOR SELECT
USING (
  is_founder(auth.jwt() ->> 'email')
  OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

-- Allow Admins/Founders to Update
CREATE POLICY "Admins update feedback" ON public.feedback_messages
FOR UPDATE
USING (
  is_founder(auth.jwt() ->> 'email')
  OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

-- 5. Grant Admin/Founder status to Casteelio
UPDATE public.profiles 
SET is_admin = TRUE, manual_pro_override = TRUE 
WHERE email = 'casteelio@gmail.com';
