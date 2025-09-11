export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: string[]
  videoLimit?: number
  isActive: boolean
}

export interface UserSubscription {
  id: string
  planId: string
  userId: string
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialVideosUsed?: number
  trialVideosLimit?: number
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free_trial: {
    id: 'free_trial',
    name: 'Free Trial',
    price: 0,
    features: [
      '5 video credits',
      'Basic AI voice cloning',
      'Standard video quality',
      'Email support',
    ],
    videoLimit: 5,
    isActive: true,
  },
  basic: {
    id: 'plan_TfXAKUpmBXIMA',
    name: 'Basic',
    price: 49.99,
    features: [
      'Unlimited video creation',
      'Advanced AI voice cloning',
      'HD video quality',
      'CSV prospect upload',
      'Email & chat support',
      'Custom branding',
    ],
    isActive: true,
  },
  pro: {
    id: 'plan_N97PuJswksstF',
    name: 'Pro',
    price: 99,
    features: [
      'Everything in Basic',
      '4K video quality',
      'Advanced analytics',
      'Team collaboration',
      'Priority support',
      'API access',
      'White-label options',
    ],
    isActive: true,
  },
  agency: {
    id: 'plan_HeStJKVzCFSSa',
    name: 'Agency',
    price: 199,
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom training',
      'Enterprise security',
    ],
    isActive: true,
  },
}

export function getPlanById(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS[planId] || null
}

export function canCreateVideo(subscription: UserSubscription): boolean {
  const plan = getPlanById(subscription.planId)
  
  if (!plan) return false
  
  // Check if subscription is active
  if (subscription.status !== 'active' && subscription.status !== 'trial') {
    return false
  }
  
  // Check if trial has videos remaining
  if (subscription.status === 'trial' && plan.videoLimit) {
    const videosUsed = subscription.trialVideosUsed || 0
    return videosUsed < plan.videoLimit
  }
  
  // Check if current period is valid
  const now = new Date()
  if (now > subscription.currentPeriodEnd) {
    return false
  }
  
  return true
}

export function getVideoLimitRemaining(subscription: UserSubscription): number | null {
  const plan = getPlanById(subscription.planId)
  
  if (!plan || !plan.videoLimit) return null
  
  if (subscription.status === 'trial') {
    const videosUsed = subscription.trialVideosUsed || 0
    return Math.max(0, plan.videoLimit - videosUsed)
  }
  
  return null
}

export function isTrialExpired(subscription: UserSubscription): boolean {
  if (subscription.status !== 'trial') return false
  
  const plan = getPlanById(subscription.planId)
  if (!plan || !plan.videoLimit) return false
  
  const videosUsed = subscription.trialVideosUsed || 0
  return videosUsed >= plan.videoLimit
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}