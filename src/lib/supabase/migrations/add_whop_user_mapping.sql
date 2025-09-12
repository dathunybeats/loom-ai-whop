-- Add whop_user_id field to profiles table for user mapping
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whop_user_id TEXT;

-- Add whop_user_id field to user_subscriptions table 
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS whop_user_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_whop_user_id ON profiles(whop_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_whop_user_id ON user_subscriptions(whop_user_id);

-- Add a function to link subscriptions to users when they sign in
CREATE OR REPLACE FUNCTION link_whop_subscription()
RETURNS trigger AS $$
BEGIN
  -- When a user signs in, try to link any unmapped subscriptions with their whop_user_id
  IF NEW.whop_user_id IS NOT NULL THEN
    UPDATE user_subscriptions 
    SET user_id = NEW.id 
    WHERE whop_user_id = NEW.whop_user_id 
      AND user_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically link subscriptions
DROP TRIGGER IF EXISTS trigger_link_whop_subscription ON profiles;
CREATE TRIGGER trigger_link_whop_subscription
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION link_whop_subscription();