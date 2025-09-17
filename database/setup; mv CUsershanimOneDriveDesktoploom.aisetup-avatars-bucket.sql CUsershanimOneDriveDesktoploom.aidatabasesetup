-- Set up Supabase Storage for video uploads
-- This creates a secure bucket to store video files

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos', 
  false, -- private bucket (users can only access their own files)
  1073741824, -- 1GB file size limit
  ARRAY['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime']
);

-- Create storage bucket for voice samples  
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-samples',
  'voice-samples',
  false, -- private bucket
  52428800, -- 50MB file size limit (voice samples are smaller)
  ARRAY['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm']
);

-- Set up RLS policies for storage
-- Users can only access their own files

-- Policy for videos bucket
CREATE POLICY "Users can upload their own videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own videos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for voice-samples bucket
CREATE POLICY "Users can upload their own voice samples" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'voice-samples' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own voice samples" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'voice-samples' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own voice samples" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'voice-samples' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own voice samples" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'voice-samples' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Verify buckets were created
SELECT * FROM storage.buckets WHERE id IN ('videos', 'voice-samples');