-- Clean up backup tables after successful migration
-- Run this after verifying the migration was successful

-- Drop backup tables
DROP TABLE IF EXISTS public.analytics_backup_20250919_131042;
DROP TABLE IF EXISTS public.profiles_backup_20250919_131325;
DROP TABLE IF EXISTS public.user_subscriptions_backup_20250919_131325;

-- Clean up any other backup tables that might exist from previous runs
DO $$
DECLARE
    backup_table record;
BEGIN
    -- Find and drop any other backup tables
    FOR backup_table IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name LIKE '%_backup_%'
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS public.%I', backup_table.table_name);
        RAISE NOTICE 'Dropped backup table: %', backup_table.table_name;
    END LOOP;

    RAISE NOTICE 'Backup table cleanup completed';
END $$;