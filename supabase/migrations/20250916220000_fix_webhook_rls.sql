-- Fix RLS policies to allow webhook updates
-- The webhook needs to update user_subscriptions without user authentication

-- First, let's check current policies and create new ones for service role access

-- Allow service role to perform all operations on user_subscriptions
CREATE POLICY "Allow service role full access to user_subscriptions"
ON public.user_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service role to perform all operations on profiles
CREATE POLICY "Allow service role full access to profiles"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Make sure service role can access auth.users if needed
-- Note: This is typically already allowed, but let's be explicit

-- Grant necessary permissions to service role
GRANT ALL ON public.user_subscriptions TO service_role;
GRANT ALL ON public.profiles TO service_role;

-- Comment for future reference
COMMENT ON POLICY "Allow service role full access to user_subscriptions" ON public.user_subscriptions
IS 'Allows webhooks and server-side operations to manage user subscriptions';

COMMENT ON POLICY "Allow service role full access to profiles" ON public.profiles
IS 'Allows webhooks and server-side operations to manage user profiles';