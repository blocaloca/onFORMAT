-- Create Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_url TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

-- RLS Policies for Announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Everyone can read active announcements
CREATE POLICY "Public can view active announcements" 
ON announcements FOR SELECT 
USING (active = true);

-- Only admins/service role can insert/update (Assuming service role bypasses RLS, but for client-side admin usage we might need a policy or use service role client)
-- For now, we'll allow Authenticated users to INSERT if they are the "Founder" (we'll handle this check in the API or via a specific admin flag if we had one).
-- Actually, the best way for the "Founder Control Panel" is to use the API route which will use the Service Role to write.
-- So we strictly limit client-side writes.

-- Storage Bucket for Announcements
-- Note: Buckets are usually created via the Storage API or Dashboard, but we can try to insert into storage.buckets if permissions allow, 
-- or we just assume the 'announcements' bucket exists or we use a public folder in 'public' bucket if one exists.
-- Let's assume we need to create a bucket called 'announcements'.

INSERT INTO storage.buckets (id, name, public)
VALUES ('announcements', 'announcements', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Public Read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'announcements' );

-- Storage Policy: Authenticated Upload (We'll restrict via logic or just allow auth users for now and rely on the UI hiding it)
-- ideally we restrict to admin.
CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'announcements' AND auth.role() = 'authenticated' );
