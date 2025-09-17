-- User subscriptions table to track Whop subscriptions
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  whop_membership_id TEXT UNIQUE NOT NULL,
  whop_user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL, -- plan_TfXAKUpmBXIMA, plan_N97PuJswksstF, plan_HeStJKVzCFSSa
  plan_name TEXT NOT NULL, -- Basic, Pro, Agency
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, expired, past_due
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User trial tracking for free trial users
CREATE TABLE user_trials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  videos_used INTEGER DEFAULT 0,
  videos_limit INTEGER DEFAULT 5,
  trial_start TIMESTAMPTZ DEFAULT NOW(),
  trial_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  status TEXT DEFAULT 'active', -- active, expired, converted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video usage tracking
CREATE TABLE video_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  video_type TEXT NOT NULL, -- trial, basic, pro, agency
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_whop_membership_id ON user_subscriptions(whop_membership_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_trials_user_id ON user_trials(user_id);
CREATE INDEX idx_video_usage_user_id ON video_usage(user_id);

-- RLS policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscription data
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own trial" ON user_trials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own video usage" ON video_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all subscription data (for webhooks)
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage trials" ON user_trials
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage video usage" ON video_usage
  FOR ALL USING (auth.role() = 'service_role');

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON user_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_trials_updated_at 
  BEFORE UPDATE ON user_trials 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user can create video
CREATE OR REPLACE FUNCTION can_user_create_video(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  active_subscription user_subscriptions%ROWTYPE;
  user_trial user_trials%ROWTYPE;
BEGIN
  -- Check for active paid subscription
  SELECT * INTO active_subscription 
  FROM user_subscriptions 
  WHERE user_id = user_uuid 
    AND status = 'active' 
    AND current_period_end > NOW()
  LIMIT 1;
  
  IF FOUND THEN
    RETURN TRUE;
  END IF;
  
  -- Check for active trial with remaining videos
  SELECT * INTO user_trial 
  FROM user_trials 
  WHERE user_id = user_uuid 
    AND status = 'active' 
    AND trial_end > NOW()
    AND videos_used < videos_limit
  LIMIT 1;
  
  IF FOUND THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;