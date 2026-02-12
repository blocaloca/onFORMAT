-- ==================================================
-- MIGRATION: 004_PHASE1_SECURITY.sql
-- DESCRIPTION: Enforces "Zero Leakage" and Syncs Document Crew to Permissions
-- ==================================================

-- 1. SECURITY: Ensure Projects Table is Locked Down
-- We drop existing policies to ensure no "permissive" leaks exist.
DROP POLICY IF EXISTS "Projects Visibility" ON public.projects;
DROP POLICY IF EXISTS "Projects are visible to users" ON public.projects;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.projects;
DROP POLICY IF EXISTS "Strict Project Access" ON public.projects;

CREATE POLICY "Strict Project Access" ON public.projects
FOR ALL
USING (
  -- 1. Owner Access
  auth.uid() = user_id 
  OR 
  -- 2. Founder Override (God Mode)
  (auth.jwt() ->> 'email') = 'casteelio@gmail.com'
  OR
  -- 3. Explicit Crew Membership
  EXISTS (
    SELECT 1 FROM public.crew_membership cm 
    WHERE cm.project_id = projects.id 
    AND cm.user_email = (auth.jwt() ->> 'email')
  )
);

-- 2. SECURITY: Document Access inherits from Project Access
DROP POLICY IF EXISTS "Documents Visibility" ON public.documents;
DROP POLICY IF EXISTS "Documents are visible to crew" ON public.documents;
DROP POLICY IF EXISTS "Strict Document Access" ON public.documents;

CREATE POLICY "Strict Document Access" ON public.documents
FOR ALL
USING (
  -- Check Project Permissions directly to avoid duplicating logic
  -- BUT we must repeat the logic because RLS on Joined Tables can be recursive/perf heavy
  -- Optimized: Check Project Ownership OR Founder OR Membership
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = documents.project_id
    AND (
       p.user_id = auth.uid()
       OR
       (auth.jwt() ->> 'email') = 'casteelio@gmail.com'
       OR
       EXISTS (
         SELECT 1 FROM public.crew_membership cm
         WHERE cm.project_id = p.id
         AND cm.user_email = (auth.jwt() ->> 'email')
       )
    )
  )
);

-- 3. AUTOMATION: Sync Crew List Document -> Permissions Table
-- Validates user definition: "Crew members are defined as entries... on the crew list document"

CREATE OR REPLACE FUNCTION public.sync_crew_from_document()
RETURNS TRIGGER AS $$
DECLARE
  crew_item jsonb;
  target_email text;
  target_role text;
  active_emails text[] := ARRAY[]::text[];
  crew_array jsonb;
BEGIN
  -- Only run for crew-list documents
  IF NEW.type <> 'crew-list' THEN
    RETURN NEW;
  END IF;

  -- Get the crew array, defaulting to validation-safe empty array
  crew_array := COALESCE(NEW.content -> 'crew', '[]'::jsonb);

  -- Loop through the 'crew' array
  FOR crew_item IN SELECT * FROM jsonb_array_elements(crew_array)
  LOOP
    target_email := lower(trim(COALESCE(crew_item ->> 'email', '')));
    target_role := COALESCE(crew_item ->> 'role', 'viewer');

    -- Ignore empty emails
    IF target_email IS NOT NULL AND target_email <> '' THEN
      -- Add to our list of "active" emails for cleanup later
      active_emails := array_append(active_emails, target_email);

      -- Upsert into crew_membership
      INSERT INTO public.crew_membership (project_id, user_email, role)
      VALUES (NEW.project_id, target_email, target_role)
      ON CONFLICT (project_id, user_email) 
      DO UPDATE SET role = EXCLUDED.role;
    END IF;
  END LOOP;

  -- CLEANUP: Remove access for anyone removed from the document
  -- If active_emails is empty (cleared list), everyone is removed.
  -- This enforces "Zero Leakage"
  DELETE FROM public.crew_membership
  WHERE project_id = NEW.project_id
  AND user_email <> ALL(active_emails);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to recreate
DROP TRIGGER IF EXISTS trigger_sync_crew_permissions ON public.documents;

CREATE TRIGGER trigger_sync_crew_permissions
  AFTER INSERT OR UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_crew_from_document();

-- 4. CLEANUP: Ensure unique constraints allow the UPSERT above to work
-- (In case migration 002 didn't apply it correctly, we re-assert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'crew_membership_project_id_user_email_key'
  ) THEN
    -- Try to add the constraint if missing
    ALTER TABLE public.crew_membership ADD CONSTRAINT crew_membership_project_id_user_email_key UNIQUE (project_id, user_email);
  EXCEPTION
    WHEN duplicate_table THEN NULL; -- constraint likely exists under different name or caught by check
    WHEN OTHERS THEN RAISE NOTICE 'Constraint check failed/skipped';
  END;
END $$;
