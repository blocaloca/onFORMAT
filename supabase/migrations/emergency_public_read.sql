-- EMERGENCY DEBUG: ALLOW PUBLIC READ
-- This helps verify if data exists but is being hidden by RLS.
-- Run this, then reload dashboard. If projects appear, the issue is strict ID mismatch.

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Public read projects" ON projects;

CREATE POLICY "Emergency Public Read" ON projects
    FOR SELECT TO authenticated
    USING (true);  -- Authenticated users see ALL projects
