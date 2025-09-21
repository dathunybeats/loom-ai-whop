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

interface UserData {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  company: string | null
  plan_id: string
  plan_name: string | null
  subscription_status: 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due'
  billing_period: string | null
  current_period_start: string
  current_period_end: string
  videos_used: number
  videos_limit: number
  dodo_subscription_id: string | null
  dodo_customer_id: string | null
  dodo_checkout_session_id: string | null
  email_notifications: boolean | null
  marketing_emails: boolean | null
  new_project_notifications: boolean | null
  video_generation_notifications: boolean | null
  welcomed_at: string | null
  onboarding_completed: boolean | null
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
  welcomedAt?: string | null
}

interface SubscriptionContextType {
  user: User | null
  userData: UserData | null
  planInfo: PlanInfo | null
  loading: boolean
  canCreateVideo: boolean
  refreshSubscription: () => Promise<void>
  createTrialSubscription: () => Promise<boolean>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user: authUser, loading: authLoading } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const lastFetchedUserIdRef = useRef<string | null>(null)
  const pendingFetchRef = useRef<Promise<void> | null>(null)
  const isInitializedRef = useRef(false)
  const mountedRef = useRef(true)
  const planInfoRef = useRef<PlanInfo | null>(null)
  const userDataRef = useRef<UserData | null>(null)

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
      userDataRef.current !== null

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
          console.log('SubscriptionContext: Fetching user data...')
          const { data: userRecord, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single()

          let normalizedUserData = userRecord

          if (userError && userError.code === 'PGRST116') {
            console.log('SubscriptionContext: No user record found, creating trial user')
            const created = await createTrialForUser(currentUser, { skipRefresh: true })
            if (!created) {
              throw new Error('Failed to create trial user')
            }

            const { data: createdUserData, error: createdUserError } = await supabase
              .from('users')
              .select('*')
              .eq('id', currentUser.id)
              .single()

            if (createdUserError) {
              console.error('SubscriptionContext: User fetch error after trial creation:', createdUserError)
              throw createdUserError
            }

            normalizedUserData = createdUserData
          } else if (userError) {
            console.error('SubscriptionContext: User fetch error:', userError)
            throw userError
          }

          if (!normalizedUserData) {
            throw new Error('SubscriptionContext: Unable to resolve user data')
          }

          console.log('SubscriptionContext: User data fetched successfully:', normalizedUserData.id)
          if (mountedRef.current) {
            userDataRef.current = normalizedUserData
            setUserData(normalizedUserData)
          }

          const planConfig = PLAN_CONFIGS[normalizedUserData.plan_id as keyof typeof PLAN_CONFIGS] || PLAN_CONFIGS.trial

          const isActive = normalizedUserData.subscription_status === 'active' || normalizedUserData.subscription_status === 'trial'
          const videosRemaining = normalizedUserData.videos_limit === -1 ? null :
            Math.max(0, normalizedUserData.videos_limit - normalizedUserData.videos_used)

          const planInfoData: PlanInfo = {
            planName: normalizedUserData.plan_name || planConfig.name,
            planId: normalizedUserData.plan_id,
            status: normalizedUserData.subscription_status,
            isActive,
            videosRemaining,
            videosUsed: normalizedUserData.videos_used,
            videosLimit: normalizedUserData.videos_limit,
            currentPeriodEnd: normalizedUserData.current_period_end,
            price: planConfig.price,
            welcomedAt: normalizedUserData.welcomed_at || null
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
      console.log('SubscriptionContext: Creating trial user record for user:', targetUser.id)

      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 7) // 7-day trial

      const trialUserData = {
        id: targetUser.id,
        email: targetUser.email,
        plan_id: 'trial',
        plan_name: 'Trial',
        subscription_status: 'trial' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: trialEnd.toISOString(),
        videos_used: 0,
        videos_limit: 5,
        billing_period: 'trial'
      }

      const { error } = await supabase
        .from('users')
        .upsert(trialUserData, { onConflict: 'id' })

      if (error) {
        console.error('SubscriptionContext: Failed to create trial user:', error)
        return false
      }

      console.log('SubscriptionContext: Trial user created')
      if (!skipRefresh) {
        await fetchUserData(targetUser, { force: true })
      }
      return true

    } catch (error) {
      console.error('SubscriptionContext: Error creating trial user:', error)
      return false
    }
  }

  const createTrialSubscription = async (): Promise<boolean> => {
    if (!authUser) return false
    return createTrialForUser(authUser)
  }

  const refreshSubscription = async () => {
    if (authUser) {
      await fetchUserData(authUser, { force: true })
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
      userDataRef.current = null
      setUserData(null)
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
      userDataRef.current !== null

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
        userData,
        planInfo,
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
