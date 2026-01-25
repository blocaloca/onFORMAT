-- Enable RLS on crew_membership if not already enabled
ALTER TABLE crew_membership ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all crew memberships (needed to see who is online)
CREATE POLICY "Enable read access for all users" ON "public"."crew_membership"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update their own online status
CREATE POLICY "Enable update for users based on email" ON "public"."crew_membership"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.email() = user_email)
WITH CHECK (auth.email() = user_email);
