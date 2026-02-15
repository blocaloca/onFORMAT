-- Migration: 010_FIX_ANNOUNCEMENTS_TABLE
-- Description: Ensures Announcements Table exists and has correct policies.
-- Fixes "Failed to publish" error by guaranteeing schema existence.

-- 1. Create Announcements Table (if not exists)
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    media_url TEXT,
    message TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Public Read (Active only)
DROP POLICY IF EXISTS "Public can view active announcements" ON public.announcements;
CREATE POLICY "Public can view active announcements" 
ON public.announcements FOR SELECT 
USING (active = true);

-- Admin/Owner Insert/Update (using is_founder or is_admin)
DROP POLICY IF EXISTS "Admins can insert announcements" ON public.announcements;
CREATE POLICY "Admins can insert announcements" 
ON public.announcements FOR INSERT 
WITH CHECK (
  is_founder(auth.jwt() ->> 'email')
  OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

DROP POLICY IF EXISTS "Admins can update announcements" ON public.announcements;
CREATE POLICY "Admins can update announcements" 
ON public.announcements FOR UPDATE 
USING (
  is_founder(auth.jwt() ->> 'email')
  OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

-- 4. Storage Bucket Setup (Idempotent)
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

-- 5. Storage Policies (Clean Slate)
DROP POLICY IF EXISTS "Announcements Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Announcements Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Announcements Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Announcements Auth Delete" ON storage.objects;

-- Allow Public READ
CREATE POLICY "Announcements Public Select"
ON storage.objects FOR SELECT
USING ( bucket_id = 'announcements' );

-- Allow Authenticated Uploads (We rely on logic/UI to restrict to admins, but RLS allows auth users to upload)
CREATE POLICY "Announcements Auth Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'announcements' AND auth.role() = 'authenticated' );

CREATE POLICY "Announcements Auth Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'announcements' AND auth.role() = 'authenticated' );

CREATE POLICY "Announcements Auth Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'announcements' AND auth.role() = 'authenticated' );
