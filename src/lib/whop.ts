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
  
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 14) // 14 day trial
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      plan_id: 'trial',
      status: 'trial',
      current_period_end: trialEnd.toISOString(),
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
  
  // Check if subscription is active
  if (subscription.status !== 'active' && subscription.status !== 'trial') {
    return false
  }
  
  // Check if current period is valid
  const now = new Date()
  const periodEnd = new Date(subscription.current_period_end)
  if (now > periodEnd) {
    return false
  }
  
  // Check video limit
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

  // Check if period is still valid
  const now = new Date()
  const periodEnd = new Date(subscription.current_period_end)
  const isActive = subscription.status === 'active' || subscription.status === 'trial'
  const isNotExpired = now <= periodEnd

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