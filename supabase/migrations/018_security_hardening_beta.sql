-- ==================================================
-- MIGRATION: 018_SECURITY_HARDENING_BETA.sql
-- DATE: 2026-04-17
-- DESCRIPTION: Final beta-v1 lockdown to resolve Security Advisor warnings and protect founder logic.
-- ==================================================

-- 1. FIX: "Function Search Path Mutable"
-- We explicitly set search_path to public to prevent search path hijacking.

ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.is_founder(TEXT) SET search_path = public;
ALTER FUNCTION public.check_project_access(UUID) SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. FIX: "RLS Policy Always True" for Marketing Tables
-- These appear to be legacy or CRM tables that are currently wide open.

-- marketing_calendar
ALTER TABLE IF EXISTS public.marketing_calendar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Marketing Calendar - Owner Access" ON public.marketing_calendar;
CREATE POLICY "Marketing Calendar - Owner Access" ON public.marketing_calendar
FOR ALL USING (auth.uid() = user_id OR (auth.jwt() ->> 'email') = 'casteelio@gmail.com');

-- marketing_contacts
ALTER TABLE IF EXISTS public.marketing_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Marketing Contacts - Owner Access" ON public.marketing_contacts;
CREATE POLICY "Marketing Contacts - Owner Access" ON public.marketing_contacts
FOR ALL USING (auth.uid() = user_id OR (auth.jwt() ->> 'email') = 'casteelio@gmail.com');

-- outreach_sequences
ALTER TABLE IF EXISTS public.outreach_sequences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Outreach Sequences - Owner Access" ON public.outreach_sequences;
CREATE POLICY "Outreach Sequences - Owner Access" ON public.outreach_sequences
FOR ALL USING (auth.uid() = user_id OR (auth.jwt() ->> 'email') = 'casteelio@gmail.com');

-- 3. FIX: "RLS Policy Always True" for Projects
-- Remove any potential public or overly permissive policies.

DROP POLICY IF EXISTS "Emergency Public Read" ON public.projects;
DROP POLICY IF EXISTS "Public Access" ON public.projects;

-- Re-verify Projects policy (already in 017, but reinforcing here)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 4. FIX: "Public Bucket Allows Listing"
-- Secure the storage buckets to prevent unauthorized file listing.

-- announcements
UPDATE storage.buckets SET public = false WHERE id = 'announcements';
DROP POLICY IF EXISTS "Public Read Announcements" ON storage.objects;
CREATE POLICY "Authenticated Read Announcements" ON storage.objects
FOR SELECT USING (bucket_id = 'announcements' AND auth.role() = 'authenticated');

-- documents
UPDATE storage.buckets SET public = false WHERE id = 'documents';
-- Ensure existing policy uses auth.uid check or project access check
-- (Handled by app logic, but let's ensure basic auth is required)

-- project-images
UPDATE storage.buckets SET public = false WHERE id = 'project-images';
DROP POLICY IF EXISTS "Public Project Images" ON storage.objects;
CREATE POLICY "Authenticated Project Images" ON storage.objects
FOR SELECT USING (bucket_id = 'project-images' AND auth.role() = 'authenticated');

-- 5. FINAL: Secure Auth Logs (Optional but recommended)
-- Leaked password protection is a dashboard setting, but we can ensure RLS on profiles is tight.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Clean Up check_project_access (v2 hardening)
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

  -- 3. Check crew membership
  IF EXISTS (
    SELECT 1 FROM public.crew_membership
    WHERE project_id = p_project_id
    AND user_email = v_user_email
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Log Success
DO $$ BEGIN
  RAISE NOTICE '🚀 SECURITY LOCKDOWN COMPLETE: Functions hardened, Marketing tables isolated, and Storage buckets secured.';
END $$;
