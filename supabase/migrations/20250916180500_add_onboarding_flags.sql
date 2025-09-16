-- Add onboarding/welcome flags to user_subscriptions
alter table public.user_subscriptions
add column if not exists welcomed_at timestamptz null,
add column if not exists onboarding_completed boolean null;

-- Optional: set default false for onboarding_completed
alter table public.user_subscriptions
alter column onboarding_completed set default false;

