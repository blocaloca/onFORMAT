-- Enable the storage extension if not already enabled (usually enabled by default)
-- CREATE EXTENSION IF NOT EXISTS "storage";

-- Create the 'documents' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public access to read files in the 'documents' bucket
create policy "Public Access Documents"
  on storage.objects for select
  using ( bucket_id = 'documents' );

-- Policy: Allow public access to upload files to the 'documents' bucket
-- This is necessary for the mobile 'onSET' view where users might not be fully authenticated users of the platform (e.g. Talent/Property owners)
create policy "Public Upload Documents"
  on storage.objects for insert
  with check ( bucket_id = 'documents' );

-- Policy: Allow public access to update their own files (optional, but good for retries)
create policy "Public Update Documents"
  on storage.objects for update
  with check ( bucket_id = 'documents' );
