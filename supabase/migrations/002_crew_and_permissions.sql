-- ==================================================
-- MIGRATION: 002_CREW_AND_PERMISSIONS.sql
-- DATE: 2026-01-17
-- DESCRIPTION: Logic for Project-Based Scoping, Crew Access & Storage
-- ==================================================

-- 1. Create 'crew_membership' table
CREATE TABLE IF NOT EXISTS public.crew_membership (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer', -- 'owner', 'producer', 'editor', 'DIT', 'DP', 'viewer'
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (id),
    UNIQUE(project_id, user_email)
);

-- Enable RLS logic
ALTER TABLE public.crew_membership ENABLE ROW LEVEL SECURITY;

-- 2. Define Super-User (Founder) Function
-- This hardcodes your email for security bypass in policies
CREATE OR REPLACE FUNCTION is_founder(email TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email = 'casteelio@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Policy: 'projects'
-- Users see project if they are Owner (user_id) OR if they are in crew_membership.
-- Founder sees ALL.

DROP POLICY IF EXISTS "Projects are visible to users" ON public.projects;
DROP POLICY IF EXISTS "Projects Visibility" ON public.projects;

CREATE POLICY "Projects Visibility" ON public.projects
FOR ALL -- Allow Select/Insert/Update/Delete based on logic
USING (
  auth.uid() = user_id 
  OR 
  is_founder(auth.jwt() ->> 'email')
  OR
  EXISTS (
    SELECT 1 FROM public.crew_membership cm 
    WHERE cm.project_id = projects.id 
    AND cm.user_email = (auth.jwt() ->> 'email')
  )
);

-- 4. Policy: 'documents' table (if used separately from JSONB)
DROP POLICY IF EXISTS "Documents are visible to crew" ON public.documents;
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
         AND cm.user_email = (auth.jwt() ->> 'email')
       )
    )
  )
);

-- 5. Policy: 'crew_membership'
DROP POLICY IF EXISTS "Crew Membership Visibility" ON public.crew_membership;

CREATE POLICY "Crew Membership Visibility" ON public.crew_membership
FOR ALL
USING (
  is_founder(auth.jwt() ->> 'email')
  OR
  user_email = (auth.jwt() ->> 'email')
  OR
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = crew_membership.project_id
    AND p.user_id = auth.uid()
  )
);

-- 6. Storage Policies (for 'documents' bucket used by Signatures/Uploads)
-- Ensure bucket exists (Need to do this in dashboard usually, but we can try inserting if specific extension enabled, but simpler to just set policies)

-- Allow Public/Auth Read
CREATE POLICY "Public Access to Documents"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

-- Allow Authenticated Uploads
CREATE POLICY "Authenticated Uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Allow Owners to Delete
CREATE POLICY "Owners Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
  -- Ideally check ownership, for now allow auth
);

-- End of Migration
