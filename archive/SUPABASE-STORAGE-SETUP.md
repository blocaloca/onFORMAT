# Supabase Storage Setup Guide

## Create the Storage Bucket for Image Uploads

### Step 1: Navigate to Supabase Storage
1. Go to your Supabase project dashboard
2. Click on **Storage** in the left sidebar
3. Click **New Bucket**

### Step 2: Create the Bucket
- **Name**: `project-images`
- **Public bucket**: ✅ **Enable** (check this box)
- Click **Create Bucket**

### Step 3: Verify Bucket Configuration
1. Click on the `project-images` bucket
2. Go to **Settings** or **Policies**
3. Ensure the bucket is set to **Public**

### Step 4: Set Storage Policies (If Needed)

If uploads still fail, you may need to add these policies:

#### Policy 1: Allow Public Uploads
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images');
```

#### Policy 2: Allow Public Access
```sql
CREATE POLICY "Allow public access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-images');
```

#### Policy 3: Allow Authenticated Deletes
```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-images');
```

### Step 5: Test Upload
1. Go to your app
2. Create or open a Mood Board document
3. Try uploading an image (PNG, JPG, or WebP under 5MB)
4. Check the browser console for upload logs

### Troubleshooting

**Error: "Bucket not found"**
- Verify the bucket name is exactly `project-images` (case-sensitive)
- Make sure the bucket is created in the correct Supabase project

**Error: "Permission denied"**
- Ensure the bucket is set to **Public**
- Add the storage policies listed above in Supabase SQL Editor

**Error: "File too large"**
- Images must be under 5MB
- Compress your image before uploading

## Alternative: Use Different Bucket Name

If you prefer a different bucket name, update these files:

1. `/lib/upload-image.ts` - Lines 20, 32, 50 (change 'project-images' to your bucket name)
2. Create the bucket with your preferred name in Supabase Dashboard
