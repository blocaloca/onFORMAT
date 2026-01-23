-- ==================================================
-- MIGRATION: 003_ROLLCALL_RLS.sql
-- DESCRIPTION: Add RollCall columns and Refine RLS for Status
-- ==================================================

-- 1. Schema Update
-- Adding is_online boolean as requested.
-- Note: 'last_seen_at' might exist from previous migration, using IF NOT EXISTS.
ALTER TABLE public.crew_membership
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;

-- 2. RLS Policies
-- We need to ensure Co-workers can see each other's status.

ALTER TABLE public.crew_membership ENABLE ROW LEVEL SECURITY;

-- DROP previous policies to ensure clean slate for this table
DROP POLICY IF EXISTS "Crew Membership Visibility" ON public.crew_membership;
DROP POLICY IF EXISTS "Crew Membership Update Own" ON public.crew_membership;

-- READ POLICY (SELECT)
-- Allowed if: Founder OR Project Owner OR Self OR Co-worker in same project
CREATE POLICY "Crew Membership Visibility" ON public.crew_membership
FOR SELECT
USING (
  -- 1. Founder (Super-Admin)
  auth.jwt() ->> 'email' = 'casteelio@gmail.com'
  OR
  -- 2. Project Owner
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = crew_membership.project_id
    AND p.user_id = auth.uid()
  )
  OR
  -- 3. Self
  user_email = (auth.jwt() ->> 'email')
  OR
  -- 4. Co-worker (Anyone else in the crew for this project)
  EXISTS (
    SELECT 1 FROM public.crew_membership cm_self
    WHERE cm_self.project_id = crew_membership.project_id
    AND cm_self.user_email = (auth.jwt() ->> 'email')
  )
);

-- UPDATE POLICY
-- strict: Only the user themselves can update their own status/row.
CREATE POLICY "Crew Membership Update Own" ON public.crew_membership
FOR UPDATE
USING (
  auth.jwt() ->> 'email' = user_email
)
WITH CHECK (
  auth.jwt() ->> 'email' = user_email
);
