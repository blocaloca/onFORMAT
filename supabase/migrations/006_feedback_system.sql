-- ==================================================
-- MIGRATION: 006_FEEDBACK_SYSTEM.sql
-- DESCRIPTION: Creates feedback_messages table for the Beta Program
-- ==================================================

CREATE TABLE IF NOT EXISTS public.feedback_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT, -- Snapshot in case user is deleted
    type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'other')),
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}', -- Page URL, Browser info, etc.
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.feedback_messages ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Users can insert their own feedback
CREATE POLICY "Users can submit feedback" ON public.feedback_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. Only Admins/Founder can view feedback
-- (Using the is_admin function created in prev migration or hardcoded email check)
CREATE POLICY "Admins view feedback" ON public.feedback_messages
FOR SELECT
USING (
  (auth.jwt() ->> 'email') = 'casteelio@gmail.com'
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- 3. Only Admins/Founder can update status
CREATE POLICY "Admins update feedback" ON public.feedback_messages
FOR UPDATE
USING (
  (auth.jwt() ->> 'email') = 'casteelio@gmail.com'
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);
