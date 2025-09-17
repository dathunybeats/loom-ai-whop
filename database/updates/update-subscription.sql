-- First, let's run the database migration to add the missing columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whop_user_id TEXT;
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS whop_user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_whop_user_id ON profiles(whop_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_whop_user_id ON user_subscriptions(whop_user_id);

-- Update the user subscription for dathunytutorial@gmail.com
-- We need to change from trial to the purchased Basic plan
UPDATE user_subscriptions 
SET 
  plan_id = 'plan_TfXAKUpmBXIMA',  -- Basic plan ID
  status = 'active',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 month',
  videos_limit = 1000,  -- Basic plan limit
  updated_at = NOW()
WHERE user_id = '45c766f4-00a7-4697-a4a7-f4acb6c77ab7';  -- The user ID from the INSERT statement

-- You can also run this query to verify the update:
SELECT * FROM user_subscriptions WHERE user_id = '45c766f4-00a7-4697-a4a7-f4acb6c77ab7';