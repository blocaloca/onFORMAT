-- ==================================================
-- MIGRATION: 016_BETA_REQUESTS.sql
-- DESCRIPTION: High-fidelity Private Beta Waitlist
-- ==================================================

CREATE TABLE IF NOT EXISTS public.beta_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    project_types TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.beta_requests ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can APPLY (Insert)
CREATE POLICY "Anyone can apply for beta" ON public.beta_requests
FOR INSERT
WITH CHECK (TRUE);

-- 2. Only Admins/Founder can VIEW applications
CREATE POLICY "Admins view beta requests" ON public.beta_requests
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
CREATE POLICY "Admins update beta requests" ON public.beta_requests
FOR UPDATE
USING (
  (auth.jwt() ->> 'email') = 'casteelio@gmail.com'
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);
