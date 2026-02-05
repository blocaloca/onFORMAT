-- FIX INFINITE RECURSION
-- 1. Disable RLS momentarily to break the loop (optional, but safe)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies on projects to clear the bad logic
DROP POLICY IF EXISTS "Public read projects" ON projects;
DROP POLICY IF EXISTS "User view own projects" ON projects;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Emergency Public Read" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- 3. Re-Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 4. Create THE SINGLE, SIMPLE, SAFE POLICY
-- No Joins. No Subqueries. Just strict ownership.
CREATE POLICY "Strict Ownership" ON projects
    FOR ALL -- Applies to SELECT, INSERT, UPDATE, DELETE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Verification: Grant access to Service Role (implicit, but ensuring no block)
-- (Supabase Service Role bypasses RLS, so this is fine).
