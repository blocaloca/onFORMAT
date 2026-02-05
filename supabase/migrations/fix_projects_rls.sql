-- SECURE PROJECTS TABLE
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop insecure policies if any
DROP POLICY IF EXISTS "Public read projects" ON projects;
DROP POLICY IF EXISTS "User view own projects" ON projects;

-- 1. Users can view their own projects
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- 2. Users can insert their own projects
CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own projects
CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

-- 4. Users can delete their own projects
CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);


-- SECURE PROFILES TABLE
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop insecure policies if any
DROP POLICY IF EXISTS "Public read profiles" ON profiles;

-- 1. Users can view their own profile
-- (Optionally allow reading others if needed for team features, but strictly lock down for now)
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);
-- Note: Insert is usually handled by Service Role on signup, or user can insert their own ID?
-- Usually Profiles are created via Trigger or Service Role. 
-- Allowing Insert strictly for own ID just in case.
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);


-- SECURE CREW MEMBERSHIP
ALTER TABLE crew_membership ENABLE ROW LEVEL SECURITY;

-- 1. Users can view memberships they belong to
CREATE POLICY "Users can view own memberships" ON crew_membership
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR user_email = auth.email());

-- 2. Project Owners can view memberships for their projects
-- (This requires a join or subquery, might be expensive but necessary)
CREATE POLICY "Project owners can view crew" ON crew_membership
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = crew_membership.project_id 
            AND projects.user_id = auth.uid()
        )
    );
