-- ==================================================
-- MIGRATION: 017_SECURITY_HARDENING.sql
-- DATE: 2026-04-09
-- DESCRIPTION: Hardening RLS across all core tables to resolve Security Advisor warnings.
-- ==================================================

-- 1. Helper Functions (Security Definer to avoid RLS recursion)
-- This function checks if the current user has access to a project.
-- It works by checking ownership and crew membership.
CREATE OR REPLACE FUNCTION public.check_project_access(p_project_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_email TEXT;
  v_user_id UUID;
  v_project_owner_id UUID;
BEGIN
  v_user_id := auth.uid();
  v_user_email := auth.jwt() ->> 'email';

  -- 1. Founder Bypass (Hardcoded for emergency management)
  IF v_user_email = 'casteelio@gmail.com' THEN
    RETURN TRUE;
  END IF;

  -- 2. Check if user is the database owner of the project
  SELECT user_id INTO v_project_owner_id FROM public.projects WHERE id = p_project_id;
  IF v_project_owner_id = v_user_id THEN
    RETURN TRUE;
  END IF;

  -- 3. Check crew membership (Non-recursive check)
  IF EXISTS (
    SELECT 1 FROM public.crew_membership
    WHERE project_id = p_project_id
    AND user_email = v_user_email
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Clean Up: Drop ALL existing policies to ensure no conflicts
-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Projects
DROP POLICY IF EXISTS "Projects are visible to users" ON public.projects;
DROP POLICY IF EXISTS "Projects Visibility" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "Emergency Public Read" ON public.projects;

-- Crew Membership
DROP POLICY IF EXISTS "Crew Membership Visibility" ON public.crew_membership;

-- Documents
DROP POLICY IF EXISTS "Documents are visible to crew" ON public.documents;
DROP POLICY IF EXISTS "Documents Visibility" ON public.documents;

-- Messages
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;


-- 3. Enable RLS (Force Enforcement)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;


-- 4. Apply Hardened Policies

-- PROFILES: Strict Ownership
CREATE POLICY "profiles_owner_access" ON public.profiles
FOR ALL USING (auth.uid() = id);

-- PROJECTS: Owner + Crew + Founder
CREATE POLICY "projects_access" ON public.projects
FOR ALL USING (
  auth.uid() = user_id OR 
  public.check_project_access(id)
);

-- CREW MEMBERSHIP: Project Owner manages crew, Members can view themselves
CREATE POLICY "crew_membership_access" ON public.crew_membership
FOR ALL USING (
  (auth.jwt() ->> 'email') = user_email OR
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()) OR
  (auth.jwt() ->> 'email') = 'casteelio@gmail.com'
);

-- DOCUMENTS: Inherited project access
CREATE POLICY "documents_access" ON public.documents
FOR ALL USING (
  public.check_project_access(project_id)
);

-- MESSAGES: Inherited project access + User check
CREATE POLICY "messages_access" ON public.messages
FOR ALL USING (
  (project_id IS NOT NULL AND public.check_project_access(project_id)) OR
  (project_id IS NULL AND auth.uid() = user_id) OR
  (auth.jwt() ->> 'email') = 'casteelio@gmail.com'
);


-- 5. Storage Buckets (Final Check)
-- Note: Requires bucket 'documents' to exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('documents', 'documents', false)
  ON CONFLICT (id) DO NOTHING;
END $$;

DROP POLICY IF EXISTS "Authenticated Access" ON storage.objects;
CREATE POLICY "Authenticated Access"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'documents');

-- Log Success
DO $$ BEGIN
  RAISE NOTICE '✅ Security Hardening Complete: RLS Enabled and non-recursive policies applied.';
END $$;
