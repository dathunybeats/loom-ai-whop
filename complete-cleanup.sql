-- COMPLETE DATABASE CLEANUP (INCLUDING AUTH USERS)
-- This deletes EVERYTHING - use with caution!

-- 1. First, clear all app data tables (in correct order due to foreign keys)
DELETE FROM analytics;
DELETE FROM video_jobs;
DELETE FROM csv_uploads;
DELETE FROM prospects;
DELETE FROM projects;
DELETE FROM user_subscriptions;
DELETE FROM video_usage;
DELETE FROM profiles;

-- 2. Clear storage objects (if any)
DELETE FROM storage.objects;

-- 3. Now clear auth tables (in correct order)
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.sessions;
DELETE FROM auth.identities;
DELETE FROM auth.users;

-- 4. Reset sequences to start from 1
ALTER SEQUENCE IF EXISTS analytics_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS video_jobs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS csv_uploads_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS prospects_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS projects_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_subscriptions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS video_usage_id_seq RESTART WITH 1;

-- 5. Verify everything is clean
SELECT 'analytics' as table_name, COUNT(*) as rows FROM analytics
UNION ALL
SELECT 'video_jobs', COUNT(*) FROM video_jobs
UNION ALL
SELECT 'prospects', COUNT(*) FROM prospects
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'user_subscriptions', COUNT(*) FROM user_subscriptions
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'auth.users', COUNT(*) FROM auth.users;