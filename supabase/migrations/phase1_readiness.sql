-- Phase 1 Readiness Migration

-- 1. Create Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    message TEXT NOT NULL,
    category TEXT CHECK (category IN ('bug', 'feature', 'other')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in-progress', 'resolved', 'ignored')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Feedback
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own feedback
CREATE POLICY "Users can insert feedback" ON feedback
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow Admin (Founder) to view all
-- (Assuming Founder bypass logic handles this in App, but for SQL Access we might need a specific policy if we were strictly RLS. 
-- For now, the Admin Dashboard will likely use a Service Role client or Founder check if RLS allows reading own?)
-- Let's stick to Service Role for Admin Dashboard to be safe/easy, or define a policy for casteelio.
-- "casteelio@gmail.com" needs to see all.
-- Since email isn't directly in auth.users accessible easily in RLS without joining, we'll rely on the Admin Page using `supabaseAdmin` or just standard Select if we allow read?
-- Let's allow users to see their OWN feedback only.
CREATE POLICY "Users can view own feedback" ON feedback
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);


-- 2. Create Changelog Table
CREATE TABLE IF NOT EXISTS changelog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE changelog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read changelog" ON changelog FOR SELECT USING (true);
CREATE POLICY "Admin write changelog" ON changelog FOR ALL USING (false); -- Only Service Role for edits


-- 3. Update Crew Membership
-- Add user_id to link to Auth
ALTER TABLE crew_membership ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Migration Helper (Optional: Attempt to backfill?)
-- This depends on if we can match emails. 
-- UPDATE crew_membership cm
-- SET user_id = au.id
-- FROM auth.users au
-- WHERE lower(cm.user_email) = lower(au.email);
