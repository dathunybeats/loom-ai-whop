-- Add unique constraint for monthly video usage aggregation
-- Date: 2025-09-17 12:00:00

-- Create unique index for monthly aggregation
CREATE UNIQUE INDEX IF NOT EXISTS video_usage_user_month_key
ON public.video_usage (user_id, month);

-- Drop existing function if it exists (to avoid parameter default conflicts)
DROP FUNCTION IF EXISTS public.increment_video_usage(uuid, text);

-- Create RPC function to safely increment monthly video usage
CREATE OR REPLACE FUNCTION public.increment_video_usage(p_user_id uuid, p_month text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_limit integer := 0;
BEGIN
  -- Get current plan limit from active subscription
  SELECT COALESCE(videos_limit, 0)
  INTO v_plan_limit
  FROM public.user_subscriptions
  WHERE user_id = p_user_id
    AND (
      status = 'trial'
      OR (status = 'active' AND current_period_end > now())
      OR status = 'past_due' -- Allow processing for past_due (optional)
    )
  ORDER BY updated_at DESC
  LIMIT 1;

  -- If no active subscription found, set limit to 0
  IF v_plan_limit IS NULL THEN
    v_plan_limit := 0;
  END IF;

  -- Insert new usage record or increment existing one
  INSERT INTO public.video_usage (
    user_id, 
    month, 
    videos_generated, 
    plan_limit, 
    last_reset, 
    created_at, 
    updated_at
  )
  VALUES (
    p_user_id, 
    p_month, 
    1, 
    v_plan_limit, 
    now(), 
    now(), 
    now()
  )
  ON CONFLICT (user_id, month) DO UPDATE
    SET videos_generated = public.video_usage.videos_generated + 1,
        plan_limit = EXCLUDED.plan_limit,
        updated_at = now();

  RETURN true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_video_usage(uuid, text) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.increment_video_usage(uuid, text) IS 'Safely increments monthly video usage for a user with current plan limit snapshot';
