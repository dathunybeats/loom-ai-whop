-- EMERGENCY ROLLBACK SCRIPT
-- Use this ONLY if something goes wrong with the schema optimization
-- This script will attempt to restore the original schema structure

-- WARNING: This should only be used if the migration fails
-- Run this manually if you need to rollback the changes

-- Step 1: Recreate profiles table from backup
DO $$
DECLARE
    backup_table text;
BEGIN
    -- Find the most recent profiles backup
    SELECT table_name INTO backup_table
    FROM information_schema.tables
    WHERE table_name LIKE 'profiles_backup_%'
    ORDER BY table_name DESC
    LIMIT 1;

    IF backup_table IS NOT NULL THEN
        EXECUTE format('CREATE TABLE profiles AS SELECT * FROM %I', backup_table);

        -- Recreate primary key and foreign key
        ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
        ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);

        -- Recreate RLS policies
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
        CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

        RAISE NOTICE 'Restored profiles table from backup: %', backup_table;
    ELSE
        RAISE NOTICE 'No profiles backup found';
    END IF;
END $$;

-- Step 2: Recreate user_subscriptions table from backup
DO $$
DECLARE
    backup_table text;
BEGIN
    -- Find the most recent user_subscriptions backup
    SELECT table_name INTO backup_table
    FROM information_schema.tables
    WHERE table_name LIKE 'user_subscriptions_backup_%'
    ORDER BY table_name DESC
    LIMIT 1;

    IF backup_table IS NOT NULL THEN
        EXECUTE format('CREATE TABLE user_subscriptions AS SELECT * FROM %I', backup_table);

        -- Recreate constraints
        ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);
        ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id);
        ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

        -- Recreate check constraints
        ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_status_check
        CHECK (status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text, 'trial'::text, 'past_due'::text]));

        RAISE NOTICE 'Restored user_subscriptions table from backup: %', backup_table;
    ELSE
        RAISE NOTICE 'No user_subscriptions backup found';
    END IF;
END $$;

-- Step 3: Recreate analytics table from backup if needed
DO $$
DECLARE
    backup_table text;
BEGIN
    -- Find the most recent analytics backup
    SELECT table_name INTO backup_table
    FROM information_schema.tables
    WHERE table_name LIKE 'analytics_backup_%'
    ORDER BY table_name DESC
    LIMIT 1;

    IF backup_table IS NOT NULL THEN
        EXECUTE format('CREATE TABLE analytics AS SELECT * FROM %I', backup_table);

        -- Recreate constraints
        ALTER TABLE analytics ADD CONSTRAINT analytics_pkey PRIMARY KEY (id);
        ALTER TABLE analytics ADD CONSTRAINT analytics_prospect_id_fkey FOREIGN KEY (prospect_id) REFERENCES prospects(id);

        -- Recreate check constraint
        ALTER TABLE analytics ADD CONSTRAINT analytics_event_type_check
        CHECK (event_type = ANY (ARRAY['view'::text, 'click'::text, 'share'::text, 'download'::text]));

        RAISE NOTICE 'Restored analytics table from backup: %', backup_table;
    ELSE
        RAISE NOTICE 'No analytics backup found';
    END IF;
END $$;

-- Step 4: Update foreign key references back to original tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Update projects to reference profiles again
        ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
        ALTER TABLE projects ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

        -- Update prospects to reference profiles again
        ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_user_id_fkey;
        ALTER TABLE prospects ADD CONSTRAINT prospects_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

        -- Update csv_uploads to reference profiles again
        ALTER TABLE csv_uploads DROP CONSTRAINT IF EXISTS csv_uploads_user_id_fkey;
        ALTER TABLE csv_uploads ADD CONSTRAINT csv_uploads_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

        -- Update video_usage to reference profiles again
        ALTER TABLE video_usage DROP CONSTRAINT IF EXISTS video_usage_user_id_fkey;
        ALTER TABLE video_usage ADD CONSTRAINT video_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

        RAISE NOTICE 'Updated foreign key references back to profiles table';
    END IF;
END $$;

-- Step 5: Drop the new users table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        DROP TABLE public.users CASCADE;
        RAISE NOTICE 'Dropped the new users table';
    END IF;
END $$;

-- Step 6: Add back any columns that were removed from prospects
DO $$
BEGIN
    -- Add back video_view_count if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'prospects' AND column_name = 'video_view_count'
    ) THEN
        ALTER TABLE prospects ADD COLUMN video_view_count integer DEFAULT 0;
        RAISE NOTICE 'Added back video_view_count column to prospects';
    END IF;

    -- Add back video_viewed_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'prospects' AND column_name = 'video_viewed_at'
    ) THEN
        ALTER TABLE prospects ADD COLUMN video_viewed_at timestamp with time zone;
        RAISE NOTICE 'Added back video_viewed_at column to prospects';
    END IF;

    -- Add back landing_page_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'prospects' AND column_name = 'landing_page_id'
    ) THEN
        ALTER TABLE prospects ADD COLUMN landing_page_id text UNIQUE;
        RAISE NOTICE 'Added back landing_page_id column to prospects';
    END IF;

    -- Add back social_media_url if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'prospects' AND column_name = 'social_media_url'
    ) THEN
        ALTER TABLE prospects ADD COLUMN social_media_url text;
        RAISE NOTICE 'Added back social_media_url column to prospects';
    END IF;
END $$;

DO $$
BEGIN
    RAISE NOTICE 'ROLLBACK COMPLETED - Original schema structure has been restored';
    RAISE NOTICE 'Please verify that your application is working correctly';
    RAISE NOTICE 'You may need to restart your application server';
END $$;