-- Migration: Switch to new users table and update all foreign key references
-- This completes the transition to the optimized schema

-- Step 1: Update foreign key references in all tables
-- Note: We need to be careful about the order due to foreign key constraints

-- Update projects table to reference new users table
DO $$
BEGIN
    -- Check if projects.user_id references profiles
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'projects'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
    ) THEN
        -- Drop the old foreign key constraint
        ALTER TABLE public.projects DROP CONSTRAINT projects_user_id_fkey;
        RAISE NOTICE 'Dropped old projects.user_id foreign key constraint';
    END IF;

    -- Add new foreign key constraint to users_new
    ALTER TABLE public.projects
    ADD CONSTRAINT projects_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users_new(id);
    RAISE NOTICE 'Added new projects.user_id foreign key constraint to users_new';
END $$;

-- Update prospects table to reference new users table
DO $$
BEGIN
    -- Check if prospects.user_id references profiles
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'prospects'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
    ) THEN
        -- Drop the old foreign key constraint
        ALTER TABLE public.prospects DROP CONSTRAINT prospects_user_id_fkey;
        RAISE NOTICE 'Dropped old prospects.user_id foreign key constraint';
    END IF;

    -- Add new foreign key constraint to users_new
    ALTER TABLE public.prospects
    ADD CONSTRAINT prospects_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users_new(id);
    RAISE NOTICE 'Added new prospects.user_id foreign key constraint to users_new';
END $$;

-- Update csv_uploads table to reference new users table
DO $$
BEGIN
    -- Check if csv_uploads.user_id references profiles
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'csv_uploads'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
    ) THEN
        -- Drop the old foreign key constraint
        ALTER TABLE public.csv_uploads DROP CONSTRAINT csv_uploads_user_id_fkey;
        RAISE NOTICE 'Dropped old csv_uploads.user_id foreign key constraint';
    END IF;

    -- Add new foreign key constraint to users_new
    ALTER TABLE public.csv_uploads
    ADD CONSTRAINT csv_uploads_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users_new(id);
    RAISE NOTICE 'Added new csv_uploads.user_id foreign key constraint to users_new';
END $$;

-- Update video_usage table to reference new users table
DO $$
BEGIN
    -- Check if video_usage.user_id references profiles
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'video_usage'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
    ) THEN
        -- Drop the old foreign key constraint
        ALTER TABLE public.video_usage DROP CONSTRAINT video_usage_user_id_fkey;
        RAISE NOTICE 'Dropped old video_usage.user_id foreign key constraint';
    END IF;

    -- Add new foreign key constraint to users_new
    ALTER TABLE public.video_usage
    ADD CONSTRAINT video_usage_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users_new(id);
    RAISE NOTICE 'Added new video_usage.user_id foreign key constraint to users_new';
END $$;

-- Step 2: Backup old tables before dropping
DO $$
DECLARE
    backup_suffix text;
BEGIN
    backup_suffix := '_backup_' || to_char(now(), 'YYYYMMDD_HH24MISS');

    -- Backup profiles table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        EXECUTE format('CREATE TABLE profiles%s AS SELECT * FROM profiles', backup_suffix);
        RAISE NOTICE 'Profiles table backed up to: profiles%', backup_suffix;
    END IF;

    -- Backup user_subscriptions table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions' AND table_schema = 'public') THEN
        EXECUTE format('CREATE TABLE user_subscriptions%s AS SELECT * FROM user_subscriptions', backup_suffix);
        RAISE NOTICE 'User_subscriptions table backed up to: user_subscriptions%', backup_suffix;
    END IF;
END $$;

-- Step 3: Drop old tables (they're now backed up)
DO $$
BEGIN
    -- Drop profiles table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        DROP TABLE public.profiles CASCADE;
        RAISE NOTICE 'Dropped profiles table';
    END IF;

    -- Drop user_subscriptions table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions' AND table_schema = 'public') THEN
        DROP TABLE public.user_subscriptions CASCADE;
        RAISE NOTICE 'Dropped user_subscriptions table';
    END IF;
END $$;

-- Step 4: Rename users_new to users
ALTER TABLE public.users_new RENAME TO users;

-- Update constraint names to match new table name
ALTER TABLE public.users RENAME CONSTRAINT users_new_pkey TO users_pkey;
ALTER TABLE public.users RENAME CONSTRAINT users_new_id_fkey TO users_id_fkey;
ALTER TABLE public.users RENAME CONSTRAINT users_new_subscription_status_check TO users_subscription_status_check;

-- Update index names
ALTER INDEX IF EXISTS idx_users_new_email RENAME TO idx_users_email;
ALTER INDEX IF EXISTS idx_users_new_subscription_status RENAME TO idx_users_subscription_status;
ALTER INDEX IF EXISTS idx_users_new_dodo_customer_id RENAME TO idx_users_dodo_customer_id;

DO $$
BEGIN
    RAISE NOTICE 'Renamed users_new table to users';
END $$;

-- Step 5: Update foreign key constraint names to reference the new table name
ALTER TABLE public.projects DROP CONSTRAINT projects_user_id_fkey;
ALTER TABLE public.projects ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE public.prospects DROP CONSTRAINT prospects_user_id_fkey;
ALTER TABLE public.prospects ADD CONSTRAINT prospects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE public.csv_uploads DROP CONSTRAINT csv_uploads_user_id_fkey;
ALTER TABLE public.csv_uploads ADD CONSTRAINT csv_uploads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE public.video_usage DROP CONSTRAINT video_usage_user_id_fkey;
ALTER TABLE public.video_usage ADD CONSTRAINT video_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Step 6: Final verification
DO $$
DECLARE
    users_count integer;
    projects_count integer;
    prospects_count integer;
    fk_check integer;
BEGIN
    SELECT COUNT(*) INTO users_count FROM public.users;
    SELECT COUNT(*) INTO projects_count FROM public.projects;
    SELECT COUNT(*) INTO prospects_count FROM public.prospects;

    -- Check that foreign key relationships are working
    SELECT COUNT(*) INTO fk_check
    FROM public.projects p
    JOIN public.users u ON p.user_id = u.id;

    RAISE NOTICE 'Final migration verification:';
    RAISE NOTICE '- Users: %', users_count;
    RAISE NOTICE '- Projects: %', projects_count;
    RAISE NOTICE '- Prospects: %', prospects_count;
    RAISE NOTICE '- Projects with valid user FK: %', fk_check;

    IF fk_check != projects_count THEN
        RAISE EXCEPTION 'Foreign key integrity check failed!';
    END IF;

    RAISE NOTICE 'Schema optimization completed successfully!';
    RAISE NOTICE 'New schema: users, projects, prospects, csv_uploads, video_jobs, video_usage';
END $$;