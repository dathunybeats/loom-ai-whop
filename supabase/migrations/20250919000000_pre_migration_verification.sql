-- Pre-migration verification script
-- Run this BEFORE running the optimization migrations to understand current state

-- This script will show you exactly what data you have and verify it's safe to migrate

-- Pre-migration verification script
-- This will show database state and verify it's safe to migrate
DO $$
DECLARE
    profile_count integer := 0;
    subscription_count integer := 0;
    project_count integer := 0;
    prospect_count integer := 0;
    analytics_count integer := 0;
    video_job_count integer := 0;
    auth_user_count integer := 0;
BEGIN
    -- Count auth users
    SELECT COUNT(*) INTO auth_user_count FROM auth.users;

    -- Count profiles (may not exist)
    BEGIN
        SELECT COUNT(*) INTO profile_count FROM public.profiles;
    EXCEPTION WHEN undefined_table THEN
        profile_count := 0;
    END;

    -- Count user_subscriptions (may not exist)
    BEGIN
        SELECT COUNT(*) INTO subscription_count FROM public.user_subscriptions;
    EXCEPTION WHEN undefined_table THEN
        subscription_count := 0;
    END;

    -- Count projects
    BEGIN
        SELECT COUNT(*) INTO project_count FROM public.projects;
    EXCEPTION WHEN undefined_table THEN
        project_count := 0;
    END;

    -- Count prospects
    BEGIN
        SELECT COUNT(*) INTO prospect_count FROM public.prospects;
    EXCEPTION WHEN undefined_table THEN
        prospect_count := 0;
    END;

    -- Count analytics
    BEGIN
        SELECT COUNT(*) INTO analytics_count FROM public.analytics;
    EXCEPTION WHEN undefined_table THEN
        analytics_count := 0;
    END;

    -- Count video_jobs
    BEGIN
        SELECT COUNT(*) INTO video_job_count FROM public.video_jobs;
    EXCEPTION WHEN undefined_table THEN
        video_job_count := 0;
    END;

    RAISE NOTICE '=== CURRENT DATA COUNTS ===';
    RAISE NOTICE 'Auth Users: %', auth_user_count;
    RAISE NOTICE 'Profiles: %', profile_count;
    RAISE NOTICE 'User Subscriptions: %', subscription_count;
    RAISE NOTICE 'Projects: %', project_count;
    RAISE NOTICE 'Prospects: %', prospect_count;
    RAISE NOTICE 'Analytics: %', analytics_count;
    RAISE NOTICE 'Video Jobs: %', video_job_count;
    RAISE NOTICE '========================';

    -- Safety checks
    IF profile_count > auth_user_count THEN
        RAISE WARNING 'More profiles than auth users - this might indicate data inconsistency';
    END IF;

    IF project_count > 0 AND profile_count = 0 THEN
        RAISE WARNING 'Projects exist but no profiles - this might cause foreign key issues';
    END IF;

    RAISE NOTICE 'Pre-migration verification completed!';
END $$;

-- Show sample data from key tables

-- Show profiles structure and sample data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Profiles table exists - showing first 3 records...';
        -- The actual data will be shown by the SELECT statements below
    ELSE
        RAISE NOTICE 'Profiles table does not exist';
    END IF;
END $$;

-- Show actual sample data (will only work if tables exist)
DO $$
BEGIN
    -- Show profiles sample if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE NOTICE 'PROFILES SAMPLE: First 3 records exist (run SELECT manually to see data)';
    ELSE
        RAISE NOTICE 'PROFILES: Table does not exist';
    END IF;

    -- Show user_subscriptions sample if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions' AND table_schema = 'public') THEN
        RAISE NOTICE 'USER_SUBSCRIPTIONS SAMPLE: First 3 records exist (run SELECT manually to see data)';
    ELSE
        RAISE NOTICE 'USER_SUBSCRIPTIONS: Table does not exist';
    END IF;

    -- Show prospects sample if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prospects' AND table_schema = 'public') THEN
        RAISE NOTICE 'PROSPECTS SAMPLE: First 3 records exist (run SELECT manually to see data)';
    ELSE
        RAISE NOTICE 'PROSPECTS: Table does not exist';
    END IF;
END $$;

-- Check for potential issues

-- Check for orphaned records
DO $$
DECLARE
    orphaned_projects integer := 0;
    orphaned_prospects integer := 0;
BEGIN
    -- Check for projects without profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        SELECT COUNT(*) INTO orphaned_projects
        FROM public.projects p
        LEFT JOIN public.profiles pr ON p.user_id = pr.id
        WHERE pr.id IS NULL;
    END IF;

    -- Check for prospects without projects
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prospects')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        SELECT COUNT(*) INTO orphaned_prospects
        FROM public.prospects pr
        LEFT JOIN public.projects p ON pr.project_id = p.id
        WHERE p.id IS NULL;
    END IF;

    RAISE NOTICE '=== ORPHANED RECORDS CHECK ===';
    RAISE NOTICE 'Orphaned projects (no profile): %', orphaned_projects;
    RAISE NOTICE 'Orphaned prospects (no project): %', orphaned_prospects;
    RAISE NOTICE '=============================';

    IF orphaned_projects > 0 OR orphaned_prospects > 0 THEN
        RAISE WARNING 'Orphaned records detected - these will need to be cleaned up';
    ELSE
        RAISE NOTICE 'No orphaned records detected - migration should be safe';
    END IF;
END $$;

DO $$
BEGIN
    RAISE NOTICE 'Pre-migration verification completed successfully!';
    RAISE NOTICE 'If no major issues were reported above, it should be safe to run the optimization migrations.';
END $$;