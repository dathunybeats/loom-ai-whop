-- Add voice detection and audio processing fields to support AI voice generation
-- This migration adds the necessary columns for the voice cloning and personalization workflow

-- Add voice-related fields to prospects table
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS voice_id TEXT; -- ElevenLabs voice ID for the project
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS personalized_audio_url TEXT; -- URL to personalized name audio
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS prospect_timing JSONB; -- Timing info for where "PROSPECT" was detected

-- Add voice-related fields to projects table for storing the master voice clone
ALTER TABLE projects ADD COLUMN IF NOT EXISTS master_voice_id TEXT; -- ElevenLabs voice ID cloned from uploaded video
ALTER TABLE projects ADD COLUMN IF NOT EXISTS original_audio_url TEXT; -- URL to original audio from video
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prospect_detection JSONB; -- Detection results for "PROSPECT" placeholder

-- Create audio storage bucket policy (if not exists)
-- This ensures the audio bucket exists and has proper access policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload audio files
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to audio bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'audio');

-- Allow public access to audio files (needed for playback)
CREATE POLICY IF NOT EXISTS "Allow public access to audio files" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'audio');

-- Allow users to delete their own audio files
CREATE POLICY IF NOT EXISTS "Allow users to delete own audio files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prospects_voice_id ON prospects(voice_id);
CREATE INDEX IF NOT EXISTS idx_projects_master_voice_id ON projects(master_voice_id);

-- Add comments for documentation
COMMENT ON COLUMN prospects.voice_id IS 'ElevenLabs voice ID for generating personalized audio';
COMMENT ON COLUMN prospects.personalized_audio_url IS 'URL to the generated personalized name audio file';
COMMENT ON COLUMN prospects.prospect_timing IS 'JSON object containing start/end timestamps where PROSPECT was detected';
COMMENT ON COLUMN projects.master_voice_id IS 'ElevenLabs voice ID cloned from the uploaded master video';
COMMENT ON COLUMN projects.original_audio_url IS 'URL to the original audio extracted from uploaded video';
COMMENT ON COLUMN projects.prospect_detection IS 'JSON object containing PROSPECT detection results from Whisper';