-- Simple fix for profiles not being created
-- This will create missing profiles for existing users

-- First, let's see what's in auth.users (for debugging)
-- You can run this separately: SELECT id, email, raw_user_meta_data FROM auth.users;

-- Create profiles for any users that don't have them yet
INSERT INTO public.profiles (id, email, full_name)
SELECT 
    u.id,
    u.email,
    COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        CONCAT(
            u.raw_user_meta_data->>'given_name', 
            ' ', 
            u.raw_user_meta_data->>'family_name'
        ),
        'User'
    ) as full_name
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Now let's recreate the trigger to make sure it works for future users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Simpler, more reliable trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            'User'
        )
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the fix worked
SELECT COUNT(*) as user_count FROM auth.users;
SELECT COUNT(*) as profile_count FROM public.profiles;