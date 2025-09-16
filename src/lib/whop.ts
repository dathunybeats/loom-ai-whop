import { createClient } from '@/lib/supabase/client'

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  whop_subscription_id: string | null
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  current_period_start: string
  current_period_end: string
  videos_used: number
  videos_limit: number
  created_at: string
  updated_at: string
  welcomed_at?: string | null
  onboarding_completed?: boolean | null
}

export interface VideoUsage {
  id: string
  user_id: string
  month: string
  videos_generated: number
  plan_limit: number
  last_reset: string
  created_at: string
  updated_at: string
}

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user subscription:', error)
    return null
  }

  return data
}

export async function getCurrentMonthUsage(userId: string): Promise<VideoUsage | null> {
  const supabase = createClient()
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

  const { data, error } = await supabase
    .from('video_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .maybeSingle()

  if (error) {
    console.error('Error fetching video usage:', error)
    return null
  }

  return data
}

export async function createUserTrial(userId: string): Promise<UserSubscription | null> {
  const supabase = createClient()

  // No time limit, only video count limit
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      plan_id: 'trial',
      status: 'trial',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date('2099-12-31').toISOString(), // Far future date (no time limit)
      videos_limit: 5,
      videos_used: 0
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user trial:', error)
    return null
  }

  return data
}

export async function canUserCreateVideo(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)

  if (!subscription) return false

  // Check if subscription is active or trial
  if (subscription.status !== 'active' && subscription.status !== 'trial') {
    return false
  }

  // For trial users: only check video limit (no time restrictions)
  if (subscription.status === 'trial') {
    return subscription.videos_used < subscription.videos_limit
  }

  // For paid users: check period validity and video limits
  const now = new Date()
  const periodEnd = new Date(subscription.current_period_end)
  if (now > periodEnd) {
    return false
  }

  // Check video limit (paid plans typically have high limits)
  if (subscription.videos_used >= subscription.videos_limit) {
    return false
  }

  return true
}

export async function incrementVideoUsage(userId: string): Promise<boolean> {
  const supabase = createClient()
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  
  // Use the database function to increment usage
  const { data, error } = await supabase
    .rpc('increment_video_usage', { 
      p_user_id: userId,
      p_month: currentMonth 
    })

  if (error) {
    console.error('Error incrementing video usage:', error)
    return false
  }

  return data === true
}

export async function recordVideoUsage(userId: string, projectId?: string): Promise<boolean> {
  // For now, just increment the usage counter
  // You can extend this to record more detailed usage data if needed
  return await incrementVideoUsage(userId)
}

export async function getUserPlanInfo(userId: string): Promise<{
  planName: string
  planId: string | null
  status: string
  isActive: boolean
  videosRemaining: number | null
  currentPeriodEnd: string | null
}> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    return {
      planName: 'No Plan',
      planId: null,
      status: 'inactive',
      isActive: false,
      videosRemaining: 0,
      currentPeriodEnd: null
    }
  }

  // For trials: no time expiry, only video count matters
  // For paid: check period validity
  const isActive = subscription.status === 'active' || subscription.status === 'trial'
  const isNotExpired = subscription.status === 'trial' ? true : new Date() <= new Date(subscription.current_period_end)

  const planNames: Record<string, string> = {
    'trial': 'Free Trial',
    'plan_TfXAKUpmBXIMA': 'Basic',
    'plan_N97PuJswksstF': 'Pro', 
    'plan_HeStJKVzCFSSa': 'Agency'
  }

  const planName = planNames[subscription.plan_id] || subscription.plan_id
  
  // For trial and limited plans, calculate remaining videos
  let videosRemaining: number | null = null
  if (subscription.plan_id === 'trial') {
    videosRemaining = Math.max(0, subscription.videos_limit - subscription.videos_used)
  } else {
    // Paid plans have unlimited videos (or very high limits)
    videosRemaining = null
  }

  return {
    planName,
    planId: subscription.plan_id === 'trial' ? null : subscription.plan_id,
    status: subscription.status,
    isActive: isActive && isNotExpired,
    videosRemaining,
    currentPeriodEnd: subscription.current_period_end
  }
}