-- Migration: Remove Whop fields and add Dodo Payments fields
-- Date: 2025-09-16 21:50:00

-- Update user_subscriptions table
-- Remove Whop-related columns
ALTER TABLE public.user_subscriptions
DROP COLUMN IF EXISTS whop_subscription_id,
DROP COLUMN IF EXISTS whop_user_id;

-- Add Dodo-related columns
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS dodo_subscription_id text,
ADD COLUMN IF NOT EXISTS dodo_customer_id text,
ADD COLUMN IF NOT EXISTS dodo_checkout_session_id text,
ADD COLUMN IF NOT EXISTS plan_name text,
ADD COLUMN IF NOT EXISTS billing_period text DEFAULT 'monthly';

-- Update profiles table
-- Remove Whop-related column
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS whop_user_id;

-- Add Dodo-related columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dodo_customer_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_dodo_subscription_id
ON public.user_subscriptions (dodo_subscription_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_dodo_customer_id
ON public.user_subscriptions (dodo_customer_id);

-- Update existing trial users to have proper video limits
UPDATE public.user_subscriptions
SET
  videos_limit = 5,
  plan_name = 'Trial',
  plan_id = 'trial'
WHERE status = 'trial' AND videos_limit = 0;

-- Add check constraint for valid plan statuses
ALTER TABLE public.user_subscriptions
DROP CONSTRAINT IF EXISTS user_subscriptions_status_check;

ALTER TABLE public.user_subscriptions
ADD CONSTRAINT user_subscriptions_status_check
CHECK (status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text, 'trial'::text, 'past_due'::text]));

-- Add comment for future reference
COMMENT ON TABLE public.user_subscriptions IS 'User subscription data for Dodo Payments integration';
COMMENT ON COLUMN public.user_subscriptions.dodo_subscription_id IS 'Dodo Payments subscription ID';
COMMENT ON COLUMN public.user_subscriptions.dodo_customer_id IS 'Dodo Payments customer ID';
COMMENT ON COLUMN public.user_subscriptions.dodo_checkout_session_id IS 'Dodo Payments checkout session ID';
COMMENT ON COLUMN public.user_subscriptions.plan_name IS 'Human-readable plan name (Basic, Pro, Agency)';
COMMENT ON COLUMN public.user_subscriptions.billing_period IS 'Billing period (monthly, yearly)';