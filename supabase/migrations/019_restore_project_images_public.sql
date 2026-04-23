-- ==================================================
-- MIGRATION: 019_RESTORE_PROJECT_IMAGES_PUBLIC.sql
-- DESCRIPTION: Reverts the bucket visibility change from 018. 
-- For `<img>` tags and `getPublicUrl` to work without signed URLs, the bucket MUST be public. 
-- Security is maintained by unguessable UUID filenames.
-- ==================================================

-- 1. Make the bucket public again so getPublicUrl works
UPDATE storage.buckets SET public = true WHERE id = 'project-images';

-- 2. Drop the restrictive authenticated-only policy
DROP POLICY IF EXISTS "Authenticated Project Images" ON storage.objects;

-- 3. Create a public read policy so standard HTML <img> tags can render the images
DROP POLICY IF EXISTS "Public Read Project Images" ON storage.objects;
CREATE POLICY "Public Read Project Images" ON storage.objects
FOR SELECT USING (bucket_id = 'project-images');

-- 4. Ensure uploads are still protected and only authenticated users can upload
DROP POLICY IF EXISTS "Authenticated Uploads Project Images" ON storage.objects;
CREATE POLICY "Authenticated Uploads Project Images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated');
