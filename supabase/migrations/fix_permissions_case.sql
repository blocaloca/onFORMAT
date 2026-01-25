-- FIX: Make Email Checks Case-Insensitive for RLS Policies
-- This ensures users can access data even if their auth email casing differs from the invite email.

-- 1. Update Crew Membership Visibility
DROP POLICY IF EXISTS "Crew Membership Visibility" ON public.crew_membership;

CREATE POLICY "Crew Membership Visibility" ON public.crew_membership
FOR ALL
USING (
  is_founder(auth.jwt() ->> 'email')
  OR
  LOWER(user_email) = LOWER(auth.jwt() ->> 'email')
  OR
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = crew_membership.project_id
    AND p.user_id = auth.uid()
  )
);

-- 2. Update Projects Visibility
DROP POLICY IF EXISTS "Projects Visibility" ON public.projects;

CREATE POLICY "Projects Visibility" ON public.projects
FOR ALL 
USING (
  auth.uid() = user_id 
  OR 
  is_founder(auth.jwt() ->> 'email')
  OR
  EXISTS (
    SELECT 1 FROM public.crew_membership cm 
    WHERE cm.project_id = projects.id 
    AND LOWER(cm.user_email) = LOWER(auth.jwt() ->> 'email')
  )
);

-- 3. Update Documents Visibility
DROP POLICY IF EXISTS "Documents Visibility" ON public.documents;

CREATE POLICY "Documents Visibility" ON public.documents
FOR ALL
USING (
  is_founder(auth.jwt() ->> 'email')
  OR
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = documents.project_id
    AND (
       p.user_id = auth.uid()
       OR
       EXISTS (
         SELECT 1 FROM public.crew_membership cm
         WHERE cm.project_id = p.id
         AND LOWER(cm.user_email) = LOWER(auth.jwt() ->> 'email')
       )
    )
  )
);
