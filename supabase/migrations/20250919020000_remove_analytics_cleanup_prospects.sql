-- Migration: Remove analytics table and clean up prospects table
-- Removes analytics tracking since pivoting away from that feature

-- Step 1: Backup analytics data before deletion (just in case)
-- Create a backup table with timestamp
DO $$
DECLARE
    backup_table_name text;
BEGIN
    backup_table_name := 'analytics_backup_' || to_char(now(), 'YYYYMMDD_HH24MISS');
    EXECUTE format('CREATE TABLE %I AS SELECT * FROM analytics', backup_table_name);
    RAISE NOTICE 'Analytics data backed up to table: %', backup_table_name;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Analytics table does not exist, skipping backup';
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not backup analytics table: %', SQLERRM;
END $$;

-- Step 2: Remove analytics-related columns from prospects table
-- First check if columns exist before trying to drop them
DO $$
BEGIN
    -- Remove video_view_count column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'prospects'
        AND column_name = 'video_view_count'
    ) THEN
        ALTER TABLE public.prospects DROP COLUMN video_view_count;
        RAISE NOTICE 'Dropped video_view_count column from prospects';
    END IF;

    -- Remove video_viewed_at column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'prospects'
        AND column_name = 'video_viewed_at'
    ) THEN
        ALTER TABLE public.prospects DROP COLUMN video_viewed_at;
        RAISE NOTICE 'Dropped video_viewed_at column from prospects';
    END IF;
END $$;

-- Step 3: Drop analytics table and its constraints
DO $$
BEGIN
    -- Drop the analytics table if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'analytics'
        AND table_schema = 'public'
    ) THEN
        DROP TABLE public.analytics CASCADE;
        RAISE NOTICE 'Dropped analytics table';
    ELSE
        RAISE NOTICE 'Analytics table does not exist, skipping drop';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping analytics table: %', SQLERRM;
END $$;

-- Step 4: Clean up unnecessary columns from prospects table
-- Remove columns that are no longer needed or redundant

DO $$
BEGIN
    -- Remove landing_page_id if it exists (seems unused)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'prospects'
        AND column_name = 'landing_page_id'
    ) THEN
        ALTER TABLE public.prospects DROP COLUMN landing_page_id;
        RAISE NOTICE 'Dropped landing_page_id column from prospects';
    END IF;

    -- Remove social_media_url if it exists (not being used in current flow)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'prospects'
        AND column_name = 'social_media_url'
    ) THEN
        ALTER TABLE public.prospects DROP COLUMN social_media_url;
        RAISE NOTICE 'Dropped social_media_url column from prospects';
    END IF;

    -- Remove the old status column if it exists (we have video_status which is more specific)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'prospects'
        AND column_name = 'status'
    ) THEN
        -- First check if video_status exists, if not, rename status to video_status
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'prospects'
            AND column_name = 'video_status'
        ) THEN
            ALTER TABLE public.prospects RENAME COLUMN status TO video_status;
            RAISE NOTICE 'Renamed status column to video_status in prospects';
        ELSE
            -- Both exist, drop the old status column
            ALTER TABLE public.prospects DROP COLUMN status;
            RAISE NOTICE 'Dropped redundant status column from prospects (keeping video_status)';
        END IF;
    END IF;
END $$;

-- Step 5: Add any missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_prospects_video_status ON public.prospects(video_status);
CREATE INDEX IF NOT EXISTS idx_prospects_video_generated_at ON public.prospects(video_generated_at) WHERE video_generated_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prospects_email_sent_at ON public.prospects(email_sent_at) WHERE email_sent_at IS NOT NULL;

-- Step 6: Update prospects table comments
COMMENT ON TABLE public.prospects IS 'Target recipients for personalized video campaigns';
COMMENT ON COLUMN public.prospects.video_status IS 'Status of video generation: pending, processing, completed, failed';
COMMENT ON COLUMN public.prospects.video_url IS 'URL of the generated personalized video';
COMMENT ON COLUMN public.prospects.custom_fields IS 'Additional custom data in JSON format';

-- Step 7: Verify prospects table structure
DO $$
DECLARE
    prospect_count integer;
    video_completed_count integer;
BEGIN
    SELECT COUNT(*) INTO prospect_count FROM public.prospects;

    SELECT COUNT(*) INTO video_completed_count
    FROM public.prospects
    WHERE video_status = 'completed' AND video_url IS NOT NULL;

    RAISE NOTICE 'Prospects table verification:';
    RAISE NOTICE '- Total prospects: %', prospect_count;
    RAISE NOTICE '- Completed videos: %', video_completed_count;
    RAISE NOTICE 'Prospects table cleanup completed successfully!';
END $$;