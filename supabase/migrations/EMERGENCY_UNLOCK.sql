-- EMERGENCY RESET
-- This disables the Row Level Security on 'projects' and 'profiles'.
-- This effectively reverts the database to the state where "Everything Just Worked".

-- 1. Disable RLS on core tables
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE crew_membership DISABLE ROW LEVEL SECURITY;

-- 2. Clean up the policies that caused recursion
DROP POLICY IF EXISTS "Strict Ownership" ON projects;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Public read projects" ON projects;
DROP POLICY IF EXISTS "Emergency Public Read" ON projects;
