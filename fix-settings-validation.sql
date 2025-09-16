-- Fix settings page validation and profile issues
-- Run this in your Supabase SQL Editor

-- Ensure the profiles table has all required columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS new_project_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS video_generation_notifications BOOLEAN DEFAULT true;

-- Update RLS policies for profiles table to ensure updates work
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure users can insert their own profile (for upsert operations)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Create missing profiles for existing users
INSERT INTO profiles (id, email, full_name)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', '')
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Verify profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;