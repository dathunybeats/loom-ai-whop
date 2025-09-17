-- OPTIONAL: Make videos bucket public for better performance
-- This removes the need for signed URLs and speeds up video loading
-- Only run this if you're okay with videos being publicly accessible

-- Update videos bucket to be public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'videos';

-- Add public access policy for videos
CREATE POLICY "Public video access" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

-- Note: If you use this, you can simplify VideoPlayer to use public URLs directly
-- Remove the signed URL logic and just use the public URL from the database