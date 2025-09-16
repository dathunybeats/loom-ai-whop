-- Clean up all data in your Supabase database
-- Run these commands in Supabase SQL Editor

-- 1. Clear all user-generated data (preserves auth.users)
TRUNCATE TABLE analytics RESTART IDENTITY CASCADE;
TRUNCATE TABLE video_jobs RESTART IDENTITY CASCADE;
TRUNCATE TABLE csv_uploads RESTART IDENTITY CASCADE;
TRUNCATE TABLE prospects RESTART IDENTITY CASCADE;
TRUNCATE TABLE projects RESTART IDENTITY CASCADE;
TRUNCATE TABLE user_subscriptions RESTART IDENTITY CASCADE;
TRUNCATE TABLE video_usage RESTART IDENTITY CASCADE;
TRUNCATE TABLE profiles RESTART IDENTITY CASCADE;

-- 2. If you want to also clear auth users (complete reset)
-- UNCOMMENT the lines below if you want to delete all users too
-- DELETE FROM auth.users;
-- DELETE FROM auth.identities;
-- DELETE FROM auth.sessions;

-- 3. Reset any sequences (if needed)
-- This ensures auto-increment IDs start from 1 again
SELECT setval(pg_get_serial_sequence('analytics', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('video_jobs', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('csv_uploads', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('prospects', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('projects', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('user_subscriptions', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('video_usage', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('profiles', 'id'), 1, false);

-- 4. Verify cleanup
SELECT 'analytics' as table_name, COUNT(*) as row_count FROM analytics
UNION ALL
SELECT 'video_jobs', COUNT(*) FROM video_jobs
UNION ALL
SELECT 'csv_uploads', COUNT(*) FROM csv_uploads
UNION ALL
SELECT 'prospects', COUNT(*) FROM prospects
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'user_subscriptions', COUNT(*) FROM user_subscriptions
UNION ALL
SELECT 'video_usage', COUNT(*) FROM video_usage
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;