'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

// Dodo Payments plan configurations
const PLAN_CONFIGS = {
  'pdt_ScqkGM6dvih1xrlE04Lwo': { // Basic
    name: 'Basic',
    videos_limit: 100,
    price: '$49.99'
  },
  'pdt_hixMn0obmlZ9vyr02Gmgi': { // Pro
    name: 'Pro',
    videos_limit: 500,
    price: '$99'
  },
  'pdt_pyXVf4I6gL6TY4JkNmOCN': { // Agency
    name: 'Agency',
    videos_limit: -1, // Unlimited
    price: '$199'
  },
  'trial': { // Trial
    name: 'Trial',
    videos_limit: 5,
    price: 'Free'
  }
} as const

interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  plan_name: string
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due'
  current_period_start: string
  current_period_end: string
  videos_used: number
  videos_limit: number
  dodo_subscription_id?: string
  dodo_customer_id?: string
  billing_period: string
  created_at: string
  updated_at: string
}

interface PlanInfo {
  planName: string
  planId: string | null
  status: string
  isActive: boolean
  videosRemaining: number | null
  videosUsed: number
  videosLimit: number
  currentPeriodEnd: string | null
  price: string
}

interface SubscriptionContextType {
  user: User | null
  userProfile: { full_name?: string } | null
  planInfo: PlanInfo | null
  subscription: UserSubscription | null
  loading: boolean
  canCreateVideo: boolean
  refreshSubscription: () => Promise<void>
  createTrialSubscription: () => Promise<boolean>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<{ full_name?: string } | null>(null)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchUserData = async (currentUser: User) => {
    console.log('SubscriptionContext: Fetching user data for:', currentUser.id)

    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      setUserProfile(profile)

      // Fetch or create subscription
      let { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', currentUser.id)
        .single()

      // If no subscription exists, create a trial subscription
      if (error || !subscription) {
        console.log('No subscription found, creating trial subscription')
        await createTrialSubscription()
        return // createTrialSubscription will call fetchUserData again
      }

      setSubscription(subscription)

      // Convert subscription to planInfo format
      const planConfig = PLAN_CONFIGS[subscription.plan_id as keyof typeof PLAN_CONFIGS] || PLAN_CONFIGS.trial

      const isActive = subscription.status === 'active' || subscription.status === 'trial'
      const videosRemaining = subscription.videos_limit === -1 ? null :
        Math.max(0, subscription.videos_limit - subscription.videos_used)

      const planInfoData: PlanInfo = {
        planName: subscription.plan_name || planConfig.name,
        planId: subscription.plan_id,
        status: subscription.status,
        isActive,
        videosRemaining,
        videosUsed: subscription.videos_used,
        videosLimit: subscription.videos_limit,
        currentPeriodEnd: subscription.current_period_end,
        price: planConfig.price
      }

      setPlanInfo(planInfoData)
      console.log('✅ Subscription data loaded:', planInfoData)

    } catch (error) {
      console.error('Error fetching user data:', error)
      // Set fallback trial state
      setPlanInfo({
        planName: 'Trial',
        planId: 'trial',
        status: 'trial',
        isActive: true,
        videosRemaining: 5,
        videosUsed: 0,
        videosLimit: 5,
        currentPeriodEnd: null,
        price: 'Free'
      })
    } finally {
      setLoading(false)
    }
  }

  const createTrialSubscription = async (): Promise<boolean> => {
    if (!user) return false

    try {
      console.log('Creating trial subscription for user:', user.id)

      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 7) // 7-day trial

      const trialSubscription = {
        user_id: user.id,
        plan_id: 'trial',
        plan_name: 'Trial',
        status: 'trial' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: trialEnd.toISOString(),
        videos_used: 0,
        videos_limit: 5,
        billing_period: 'trial'
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .upsert(trialSubscription, { onConflict: 'user_id' })

      if (error) {
        console.error('Failed to create trial subscription:', error)
        return false
      }

      console.log('✅ Trial subscription created')
      await fetchUserData(user) // Refresh data
      return true

    } catch (error) {
      console.error('Error creating trial subscription:', error)
      return false
    }
  }

  const refreshSubscription = async () => {
    if (user) {
      setLoading(true)
      await fetchUserData(user)
    }
  }

  // Initialize authentication and subscription data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('SubscriptionContext: Initializing auth...')
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        console.log('SubscriptionContext: Current user:', currentUser?.id)
        setUser(currentUser)

        if (currentUser) {
          await fetchUserData(currentUser)
        } else {
          console.log('SubscriptionContext: No user found')
          setLoading(false)
        }
      } catch (error: any) {
        console.error('SubscriptionContext: Auth initialization error:', error)
        setUser(null)
        setPlanInfo({
          planName: 'Trial',
          planId: 'trial',
          status: 'trial',
          isActive: true,
          videosRemaining: 5,
          videosUsed: 0,
          videosLimit: 5,
          currentPeriodEnd: null,
          price: 'Free'
        })
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('SubscriptionContext: Auth state changed:', event)
        setUser(session?.user || null)

        if (session?.user) {
          await fetchUserData(session.user)
        } else {
          setUserProfile(null)
          setPlanInfo(null)
          setSubscription(null)
          setLoading(false)
        }
      }
    )

    return () => {
      authSubscription.unsubscribe()
    }
  }, [])

  // Calculate if user can create videos
  const canCreateVideo = process.env.NODE_ENV === 'development' ? true : (
    planInfo?.isActive && (
      planInfo.videosRemaining === null || // Unlimited (paid plans)
      (planInfo.videosRemaining !== null && planInfo.videosRemaining > 0) // Trial with remaining videos
    )
  ) ?? false

  return (
    <SubscriptionContext.Provider
      value={{
        user,
        userProfile,
        planInfo,
        subscription,
        loading,
        canCreateVideo,
        refreshSubscription,
        createTrialSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}