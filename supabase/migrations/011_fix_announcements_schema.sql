-- Migration: 011_FIX_ANNOUNCEMENTS_SCHEMA
-- Description: Adds missing user_id column to announcements table if it's missing.
-- Fixes "Could not find the 'user_id' column" error.

-- 1. Add user_id column if it doesn't exist
ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Ensure RLS policies cover the new column if needed (existing policies likely cover the row, but good to double check)
-- Re-applying policies from 010 just to be safe and ensure they are active.

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Public Read (Active only)
DROP POLICY IF EXISTS "Public can view active announcements" ON public.announcements;
CREATE POLICY "Public can view active announcements" 
ON public.announcements FOR SELECT 
USING (active = true);

-- Admin/Owner Insert/Update
DROP POLICY IF EXISTS "Admins can insert announcements" ON public.announcements;
CREATE POLICY "Admins can insert announcements" 
ON public.announcements FOR INSERT 
WITH CHECK (
  is_founder(auth.jwt() ->> 'email')
  OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

DROP POLICY IF EXISTS "Admins can update announcements" ON public.announcements;
CREATE POLICY "Admins can update announcements" 
ON public.announcements FOR UPDATE 
USING (
  is_founder(auth.jwt() ->> 'email')
  OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);
