-- Migration: Merge profiles and user_subscriptions into unified users table
-- This safely preserves all data while creating a cleaner schema

-- Step 1: Create new unified users table
CREATE TABLE IF NOT EXISTS public.users_new (
  id uuid NOT NULL,

  -- Profile fields from profiles table
  email text,
  full_name text,
  avatar_url text,
  first_name text,
  last_name text,
  phone text,
  company text,

  -- Subscription fields from user_subscriptions table
  plan_id text NOT NULL DEFAULT 'trial',
  plan_name text,
  subscription_status text NOT NULL DEFAULT 'trial',
  billing_period text DEFAULT 'monthly',
  current_period_start timestamp with time zone NOT NULL DEFAULT now(),
  current_period_end timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
  videos_used integer NOT NULL DEFAULT 0,
  videos_limit integer NOT NULL DEFAULT 0,

  -- Payment integration
  dodo_subscription_id text,
  dodo_customer_id text,
  dodo_checkout_session_id text,

  -- Preferences from profiles
  email_notifications boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  new_project_notifications boolean DEFAULT true,
  video_generation_notifications boolean DEFAULT true,

  -- Onboarding from user_subscriptions
  welcomed_at timestamp with time zone,
  onboarding_completed boolean DEFAULT false,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Constraints
  CONSTRAINT users_new_pkey PRIMARY KEY (id),
  CONSTRAINT users_new_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT users_new_subscription_status_check CHECK (subscription_status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text, 'trial'::text, 'past_due'::text]))
);

-- Step 2: Migrate data from profiles and user_subscriptions
-- First, insert all users from auth.users to ensure we don't miss anyone
INSERT INTO public.users_new (id, created_at, updated_at)
SELECT
  au.id,
  au.created_at,
  au.updated_at
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

-- Step 3: Update with profile data
UPDATE public.users_new
SET
  email = p.email,
  full_name = p.full_name,
  avatar_url = p.avatar_url,
  first_name = p.first_name,
  last_name = p.last_name,
  phone = p.phone,
  company = p.company,
  email_notifications = COALESCE(p.email_notifications, true),
  marketing_emails = COALESCE(p.marketing_emails, false),
  new_project_notifications = COALESCE(p.new_project_notifications, true),
  video_generation_notifications = COALESCE(p.video_generation_notifications, true),
  dodo_customer_id = p.dodo_customer_id,
  created_at = COALESCE(p.created_at, users_new.created_at),
  updated_at = GREATEST(COALESCE(p.updated_at, users_new.updated_at), users_new.updated_at)
FROM public.profiles p
WHERE users_new.id = p.id;

-- Step 4: Update with subscription data
UPDATE public.users_new
SET
  plan_id = COALESCE(us.plan_id, 'trial'),
  plan_name = us.plan_name,
  subscription_status = COALESCE(us.status, 'trial'),
  billing_period = COALESCE(us.billing_period, 'monthly'),
  current_period_start = COALESCE(us.current_period_start, users_new.current_period_start),
  current_period_end = COALESCE(us.current_period_end, users_new.current_period_end),
  videos_used = COALESCE(us.videos_used, 0),
  videos_limit = COALESCE(us.videos_limit, 0),
  dodo_subscription_id = us.dodo_subscription_id,
  dodo_customer_id = COALESCE(us.dodo_customer_id, users_new.dodo_customer_id),
  dodo_checkout_session_id = us.dodo_checkout_session_id,
  welcomed_at = us.welcomed_at,
  onboarding_completed = COALESCE(us.onboarding_completed, false),
  created_at = LEAST(COALESCE(us.created_at, users_new.created_at), users_new.created_at),
  updated_at = GREATEST(COALESCE(us.updated_at, users_new.updated_at), users_new.updated_at)
FROM public.user_subscriptions us
WHERE users_new.id = us.user_id;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_new_email ON public.users_new(email);
CREATE INDEX IF NOT EXISTS idx_users_new_subscription_status ON public.users_new(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_new_dodo_customer_id ON public.users_new(dodo_customer_id) WHERE dodo_customer_id IS NOT NULL;

-- Step 6: Add RLS policies (copy from profiles table)
ALTER TABLE public.users_new ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON public.users_new
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users_new
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users_new
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 7: Verify data integrity
DO $$
DECLARE
    profile_count integer;
    subscription_count integer;
    new_users_count integer;
    auth_users_count integer;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    SELECT COUNT(*) INTO subscription_count FROM public.user_subscriptions;
    SELECT COUNT(*) INTO new_users_count FROM public.users_new;
    SELECT COUNT(*) INTO auth_users_count FROM auth.users;

    RAISE NOTICE 'Data migration verification:';
    RAISE NOTICE '- Profiles: %', profile_count;
    RAISE NOTICE '- Subscriptions: %', subscription_count;
    RAISE NOTICE '- New users table: %', new_users_count;
    RAISE NOTICE '- Auth users: %', auth_users_count;

    -- Ensure we have at least as many users as we had profiles
    IF new_users_count < profile_count THEN
        RAISE EXCEPTION 'Data loss detected: New users table has fewer records than profiles table';
    END IF;

    -- Ensure we didn't lose any auth users
    IF new_users_count < auth_users_count THEN
        RAISE EXCEPTION 'Data loss detected: New users table has fewer records than auth.users';
    END IF;

    RAISE NOTICE 'Data migration verification passed!';
END $$;

-- Add comments for documentation
COMMENT ON TABLE public.users_new IS 'Unified user table combining profiles and subscription data';
COMMENT ON COLUMN public.users_new.subscription_status IS 'User subscription status: active, cancelled, expired, trial, past_due';
COMMENT ON COLUMN public.users_new.videos_used IS 'Number of videos generated in current billing period';
COMMENT ON COLUMN public.users_new.videos_limit IS 'Maximum videos allowed in current billing period';