-- Quick fix for video sharing - run this in your Supabase SQL editor
-- This allows public access to projects with videos for sharing functionality

-- First, check if the policy already exists and drop it if needed
DROP POLICY IF EXISTS "Public read access for projects with videos" ON projects;

-- Allow public read access to projects that have videos
CREATE POLICY "Public read access for projects with videos" ON projects
  FOR SELECT 
  USING (base_video_url IS NOT NULL);

-- This policy allows the /share/[id] route to work without authentication
-- for any project that has a base_video_url
