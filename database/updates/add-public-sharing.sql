-- Add public sharing capability for projects
-- This allows projects to be viewed without authentication when accessed via share links

-- TEMPORARY: Allow public read access to all projects with videos for sharing
-- This policy allows anyone to read basic project info if the project has a video
CREATE POLICY "Public read access for projects with videos" ON projects
  FOR SELECT 
  USING (base_video_url IS NOT NULL);

-- Note: This is a simplified approach that makes all projects with videos publicly shareable
-- In the future, you can add a is_public_shared column for more granular control:

-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_public_shared BOOLEAN DEFAULT FALSE;
-- DROP POLICY "Public read access for projects with videos" ON projects;
-- CREATE POLICY "Public read access for shared projects" ON projects
--   FOR SELECT 
--   USING (is_public_shared = true);

-- For now, any project with a base_video_url can be shared publicly
