-- Fix prospects table schema to match existing structure
-- This will update your existing table without breaking anything

-- First, let's see what columns exist in the prospects table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'prospects' AND table_schema = 'public';

-- Add missing columns to prospects table if they don't exist
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS video_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS video_generated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS video_viewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS video_view_count INTEGER DEFAULT 0;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update user_id for existing prospects based on project ownership
UPDATE prospects 
SET user_id = projects.user_id 
FROM projects 
WHERE prospects.project_id = projects.id 
AND prospects.user_id IS NULL;

-- Make user_id NOT NULL after populating it
ALTER TABLE prospects ALTER COLUMN user_id SET NOT NULL;

-- Add video status constraint if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE prospects ADD CONSTRAINT prospects_video_status_check 
    CHECK (video_status IN ('pending', 'processing', 'completed', 'failed'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create CSV upload tracking table
CREATE TABLE IF NOT EXISTS csv_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Upload details
  filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  total_rows INTEGER NOT NULL,
  successful_imports INTEGER DEFAULT 0,
  failed_imports INTEGER DEFAULT 0,
  
  -- Processing status
  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Import results
  import_errors JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add prospect count columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prospects_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS videos_generated INTEGER DEFAULT 0;

-- Update existing prospect counts
UPDATE projects SET prospects_count = (
  SELECT COUNT(*) FROM prospects WHERE prospects.project_id = projects.id
);

UPDATE projects SET videos_generated = (
  SELECT COUNT(*) FROM prospects 
  WHERE prospects.project_id = projects.id 
  AND prospects.video_status = 'completed'
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_prospects_project_id ON prospects(project_id);
CREATE INDEX IF NOT EXISTS idx_prospects_user_id ON prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_prospects_email ON prospects(email);
CREATE INDEX IF NOT EXISTS idx_prospects_video_status ON prospects(video_status);
CREATE INDEX IF NOT EXISTS idx_prospects_created_at ON prospects(created_at);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_project_id ON csv_uploads(project_id);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_user_id ON csv_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_status ON csv_uploads(status);

-- Create unique constraint for project_id + email
DO $$ 
BEGIN
    ALTER TABLE prospects ADD CONSTRAINT prospects_project_email_unique 
    UNIQUE(project_id, email);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own prospects" ON prospects;
DROP POLICY IF EXISTS "Users can insert their own prospects" ON prospects; 
DROP POLICY IF EXISTS "Users can update their own prospects" ON prospects;
DROP POLICY IF EXISTS "Users can delete their own prospects" ON prospects;

-- Create RLS policies for prospects
CREATE POLICY "Users can view their own prospects" ON prospects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prospects" ON prospects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prospects" ON prospects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prospects" ON prospects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for csv_uploads
DROP POLICY IF EXISTS "Users can view their own CSV uploads" ON csv_uploads;
DROP POLICY IF EXISTS "Users can insert their own CSV uploads" ON csv_uploads;
DROP POLICY IF EXISTS "Users can update their own CSV uploads" ON csv_uploads;

CREATE POLICY "Users can view their own CSV uploads" ON csv_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CSV uploads" ON csv_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CSV uploads" ON csv_uploads
  FOR UPDATE USING (auth.uid() = user_id);

-- Create update trigger for prospects
CREATE OR REPLACE FUNCTION update_prospects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_prospects_updated_at ON prospects;
CREATE TRIGGER update_prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_prospects_updated_at();

-- Create function to update project counts
CREATE OR REPLACE FUNCTION update_project_prospect_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update prospects_count
  UPDATE projects 
  SET prospects_count = (
    SELECT COUNT(*) FROM prospects WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
  )
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  -- Update videos_generated count
  UPDATE projects 
  SET videos_generated = (
    SELECT COUNT(*) FROM prospects 
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) 
    AND video_status = 'completed'
  )
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update project counts
DROP TRIGGER IF EXISTS update_project_counts_on_prospect_change ON prospects;
CREATE TRIGGER update_project_counts_on_prospect_change
  AFTER INSERT OR UPDATE OR DELETE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_prospect_counts();

-- Verify tables were created successfully
SELECT 'prospects' as table_name, COUNT(*) as row_count FROM prospects
UNION ALL
SELECT 'csv_uploads' as table_name, COUNT(*) as row_count FROM csv_uploads
UNION ALL
SELECT 'projects' as table_name, COUNT(*) as row_count FROM projects;