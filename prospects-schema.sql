-- Prospects table schema for Loom.ai
-- This stores prospect data uploaded via CSV

-- Create prospects table
CREATE TABLE prospects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core prospect information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  title VARCHAR(255),
  phone VARCHAR(50),
  
  -- Additional custom fields (flexible JSON for extra data)
  custom_fields JSONB DEFAULT '{}',
  
  -- Video generation status
  video_status VARCHAR(20) DEFAULT 'pending' CHECK (video_status IN ('pending', 'processing', 'completed', 'failed')),
  video_url TEXT, -- URL to generated personalized video
  video_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Engagement tracking
  email_sent_at TIMESTAMP WITH TIME ZONE,
  video_viewed_at TIMESTAMP WITH TIME ZONE,
  video_view_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(project_id, email) -- Prevent duplicate emails per project
);

-- Indexes for performance
CREATE INDEX idx_prospects_project_id ON prospects(project_id);
CREATE INDEX idx_prospects_user_id ON prospects(user_id);
CREATE INDEX idx_prospects_email ON prospects(email);
CREATE INDEX idx_prospects_video_status ON prospects(video_status);
CREATE INDEX idx_prospects_created_at ON prospects(created_at);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_prospects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_prospects_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

-- Users can only access their own prospects
CREATE POLICY "Users can view their own prospects" ON prospects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prospects" ON prospects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prospects" ON prospects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prospects" ON prospects
  FOR DELETE USING (auth.uid() = user_id);

-- Create CSV upload tracking table
CREATE TABLE csv_uploads (
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
  import_errors JSONB DEFAULT '[]', -- Array of error details
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for CSV uploads
CREATE INDEX idx_csv_uploads_project_id ON csv_uploads(project_id);
CREATE INDEX idx_csv_uploads_user_id ON csv_uploads(user_id);
CREATE INDEX idx_csv_uploads_status ON csv_uploads(status);

-- RLS for CSV uploads
ALTER TABLE csv_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own CSV uploads" ON csv_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CSV uploads" ON csv_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CSV uploads" ON csv_uploads
  FOR UPDATE USING (auth.uid() = user_id);

-- Update projects table to track prospect counts
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prospects_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS videos_generated INTEGER DEFAULT 0;

-- Function to update project prospect counts
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

-- Triggers to update project counts
CREATE TRIGGER update_project_counts_on_prospect_change
  AFTER INSERT OR UPDATE OR DELETE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_prospect_counts();

-- Sample data for testing (optional)
/*
INSERT INTO prospects (project_id, user_id, first_name, last_name, email, company, title) VALUES
  ('5667cd76-78ac-4029-ae31-3e1ea77dbf4f', auth.uid(), 'John', 'Doe', 'john@example.com', 'Acme Corp', 'CEO'),
  ('5667cd76-78ac-4029-ae31-3e1ea77dbf4f', auth.uid(), 'Jane', 'Smith', 'jane@example.com', 'Tech Inc', 'CTO'),
  ('5667cd76-78ac-4029-ae31-3e1ea77dbf4f', auth.uid(), 'Bob', 'Johnson', 'bob@example.com', 'StartupXYZ', 'Founder');
*/

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('prospects', 'csv_uploads');