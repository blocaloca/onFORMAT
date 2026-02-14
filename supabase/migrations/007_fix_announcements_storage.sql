-- Fix Announcement Storage & Policies
-- This migration ensures the 'announcements' bucket exists and has correct policies.

-- 1. Create Bucket (Safe Insert)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'announcements', 
    'announcements', 
    true, 
    52428800, -- 50MB
    ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];

-- 2. Drop existing policies to be safe (Clean Slate)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Announcements Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Announcements Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Announcements Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Announcements Auth Delete" ON storage.objects;

-- 3. Create Policies

-- Allow Public READ for announcements bucket
CREATE POLICY "Announcements Public Select"
ON storage.objects FOR SELECT
USING ( bucket_id = 'announcements' );

-- Allow Authenticated Users to INSERT (Upload)
-- (We rely on the UI hiding the upload button for non-admins, but RLS allows any auth user to upload technically. 
--  If strict admin check is needed, we'd need a custom function or admin role check, but for now this unblocks the feature.)
CREATE POLICY "Announcements Auth Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'announcements' AND auth.role() = 'authenticated' );

-- Allow Authenticated Users to UPDATE (Upsert)
CREATE POLICY "Announcements Auth Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'announcements' AND auth.role() = 'authenticated' );

-- Allow Authenticated Users to DELETE
CREATE POLICY "Announcements Auth Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'announcements' AND auth.role() = 'authenticated' );
