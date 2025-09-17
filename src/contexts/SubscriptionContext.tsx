'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AuthChangeEvent, User } from '@supabase/supabase-js'
import { useAuth } from './AuthContext'

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
  welcomed_at?: string | null
  onboarding_completed?: boolean | null
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
  welcomedAt?: string | null
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
  const { user: authUser, loading: authLoading } = useAuth()
  const [userProfile, setUserProfile] = useState<{ full_name?: string } | null>(null)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const lastFetchedUserIdRef = useRef<string | null>(null)
  const pendingFetchRef = useRef<Promise<void> | null>(null)
  const isInitializedRef = useRef(false)
  const mountedRef = useRef(true)
  const planInfoRef = useRef<PlanInfo | null>(null)
  const subscriptionRef = useRef<UserSubscription | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const fetchUserData = async (currentUser: User, options: { force?: boolean } = {}) => {
    const { force = false } = options

    if (!currentUser) {
      console.log('SubscriptionContext: No user provided, skipping data fetch')
      if (mountedRef.current) {
        setLoading(false)
      }
      return
    }

    const hasHydratedData =
      isInitializedRef.current &&
      lastFetchedUserIdRef.current === currentUser.id &&
      planInfoRef.current !== null &&
      subscriptionRef.current !== null

    if (!force && hasHydratedData) {
      console.log('SubscriptionContext: Using cached subscription data for:', currentUser.id)
      if (mountedRef.current) {
        setLoading(false)
      }
      return
    }

    if (pendingFetchRef.current) {
      console.log('SubscriptionContext: Awaiting ongoing fetch for:', currentUser.id)
      return pendingFetchRef.current
    }

    console.log('SubscriptionContext: Fetching user data for:', currentUser.id)
    if (mountedRef.current) {
      setLoading(true)
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const fetchPromise = (async () => {
      try {
        const timeoutMs = process.env.NODE_ENV === 'development' ? 15000 : 10000
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Database operation timeout')), timeoutMs)
        })

        const dataFetchPromise = (async () => {
          console.log('SubscriptionContext: Fetching profile...')
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.warn('Profile fetch error:', profileError)
          } else {
            console.log('SubscriptionContext: Profile fetched successfully:', profile?.id)
          }

          if (mountedRef.current) {
            setUserProfile(profile || null)
          }

          console.log('SubscriptionContext: Fetching subscription...')
          const { data: subscriptionRecord, error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', currentUser.id)
            .single()

          let normalizedSubscription = subscriptionRecord

          if (subscriptionError && subscriptionError.code === 'PGRST116') {
            console.log('SubscriptionContext: No subscription found, creating trial subscription')
            const created = await createTrialForUser(currentUser, { skipRefresh: true })
            if (!created) {
              throw new Error('Failed to create trial subscription')
            }

            const { data: createdSubscription, error: createdSubscriptionError } = await supabase
              .from('user_subscriptions')
              .select('*')
              .eq('user_id', currentUser.id)
              .single()

            if (createdSubscriptionError) {
              console.error('SubscriptionContext: Subscription fetch error after trial creation:', createdSubscriptionError)
              throw createdSubscriptionError
            }

            normalizedSubscription = createdSubscription
          } else if (subscriptionError) {
            console.error('SubscriptionContext: Subscription fetch error:', subscriptionError)
            throw subscriptionError
          }

          if (!normalizedSubscription) {
            throw new Error('SubscriptionContext: Unable to resolve subscription data')
          }

          console.log('SubscriptionContext: Subscription fetched successfully:', normalizedSubscription.id)
          if (mountedRef.current) {
            subscriptionRef.current = normalizedSubscription
            setSubscription(normalizedSubscription)
          }

          const planConfig = PLAN_CONFIGS[normalizedSubscription.plan_id as keyof typeof PLAN_CONFIGS] || PLAN_CONFIGS.trial

          const isActive = normalizedSubscription.status === 'active' || normalizedSubscription.status === 'trial'
          const videosRemaining = normalizedSubscription.videos_limit === -1 ? null :
            Math.max(0, normalizedSubscription.videos_limit - normalizedSubscription.videos_used)

          const planInfoData: PlanInfo = {
            planName: normalizedSubscription.plan_name || planConfig.name,
            planId: normalizedSubscription.plan_id,
            status: normalizedSubscription.status,
            isActive,
            videosRemaining,
            videosUsed: normalizedSubscription.videos_used,
            videosLimit: normalizedSubscription.videos_limit,
            currentPeriodEnd: normalizedSubscription.current_period_end,
            price: planConfig.price,
            welcomedAt: normalizedSubscription.welcomed_at || null
          }

          if (mountedRef.current) {
            planInfoRef.current = planInfoData
            setPlanInfo(planInfoData)
          }
          console.log('SubscriptionContext: Subscription data loaded:', planInfoData)
        })()

        await Promise.race([dataFetchPromise, timeoutPromise])

        if (mountedRef.current) {
          isInitializedRef.current = true
          lastFetchedUserIdRef.current = currentUser.id
        }
      } catch (error) {
        console.error('SubscriptionContext: Error fetching user data:', error)
        if (currentUser && mountedRef.current) {
          console.log('SubscriptionContext: Setting fallback trial state')
          const fallbackPlan: PlanInfo = {
            planName: 'Trial',
            planId: 'trial',
            status: 'trial',
            isActive: true,
            videosRemaining: 5,
            videosUsed: 0,
            videosLimit: 5,
            currentPeriodEnd: null,
            price: 'Free',
            welcomedAt: null
          }
          setPlanInfo((previous) => {
            if (previous) {
              return previous
            }
            planInfoRef.current = fallbackPlan
            return fallbackPlan
          })
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        console.log('SubscriptionContext: Setting loading to false')
        if (mountedRef.current) {
          setLoading(false)
        }
        pendingFetchRef.current = null
      }
    })()

    pendingFetchRef.current = fetchPromise
    return fetchPromise
  }

  async function createTrialForUser(targetUser: User, options: { skipRefresh?: boolean } = {}): Promise<boolean> {
    const { skipRefresh = false } = options

    try {
      console.log('SubscriptionContext: Creating trial subscription for user:', targetUser.id)

      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 7) // 7-day trial

      const trialSubscription = {
        user_id: targetUser.id,
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
        console.error('SubscriptionContext: Failed to create trial subscription:', error)
        return false
      }

      console.log('SubscriptionContext: Trial subscription created')
      if (!skipRefresh) {
        await fetchUserData(targetUser, { force: true })
      }
      return true

    } catch (error) {
      console.error('SubscriptionContext: Error creating trial subscription:', error)
      return false
    }
  }

  const createTrialSubscription = async (): Promise<boolean> => {
    if (!user) return false
    return createTrialForUser(user)
  }

  const refreshSubscription = async () => {
    if (user) {
      await fetchUserData(user, { force: true })
    }
  }

  // Initialize authentication and subscription data
  // Watch for auth changes from AuthContext (eliminates duplicate auth listeners)
  useEffect(() => {
    if (authLoading) {
      setLoading(true)
      return
    }

    if (!authUser) {
      // Clear all state when no user
      lastFetchedUserIdRef.current = null
      isInitializedRef.current = false
      planInfoRef.current = null
      setPlanInfo(null)
      subscriptionRef.current = null
      setSubscription(null)
      setUserProfile(null)
      if (mountedRef.current) {
        setLoading(false)
      }
      return
    }

    // Check if we already have data for this user
    const hasHydratedData =
      isInitializedRef.current &&
      lastFetchedUserIdRef.current === authUser.id &&
      planInfoRef.current !== null &&
      subscriptionRef.current !== null

    if (hasHydratedData) {
      if (mountedRef.current) {
        setLoading(false)
      }
      return
    }

    // Fetch data for new/different user
    fetchUserData(authUser)
  }, [authUser, authLoading])

  // Calculate if user can create videos
  const canCreateVideo = process.env.NODE_ENV === 'development' ? true : (
    planInfo?.isActive && (
      planInfo.videosRemaining === null ||
      (planInfo.videosRemaining !== null && planInfo.videosRemaining > 0)
    )
  ) ?? false

  return (
    <SubscriptionContext.Provider
      value={{
        user: authUser,
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
