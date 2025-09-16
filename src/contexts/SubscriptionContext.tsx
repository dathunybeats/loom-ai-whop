'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserPlanInfo, createUserTrial, UserSubscription } from '@/lib/whop'
import { User } from '@supabase/supabase-js'

interface PlanInfo {
  planName: string
  planId: string | null
  status: string
  isActive: boolean
  videosRemaining: number | null
  currentPeriodEnd: string | null
}

interface SubscriptionContextType {
  user: User | null
  userProfile: { full_name?: string } | null
  planInfo: PlanInfo | null
  subscription: UserSubscription | null
  loading: boolean
  canCreateVideo: boolean
  refreshSubscription: () => Promise<void>
  startFreeTrial: () => Promise<boolean>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<{ full_name?: string } | null>(null)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchUserData = async (currentUser: User) => {
    console.log('SubscriptionContext: fetchUserData called for user:', currentUser.id)

    // Temporarily disable caching for debugging
    const now = Date.now()
    // const CACHE_DURATION = 30000 // 30 seconds

    // if (currentUser.id === currentUserId && now - lastFetchTime < CACHE_DURATION) {
    //   console.log('SubscriptionContext: Skipping fetch due to cache', { currentUserId, lastFetchTime, now })
    //   setLoading(false)
    //   return
    // }

    setCurrentUserId(currentUser.id)
    setLastFetchTime(now)

    console.log('SubscriptionContext: Proceeding with data fetch...')

    try {
      console.log('SubscriptionContext: Starting profile fetch...')
      // First, immediately set profile data from user metadata if available
      if (currentUser.user_metadata?.full_name) {
        setUserProfile({ full_name: currentUser.user_metadata.full_name })
      }

      // Remove timeout promises - let queries complete naturally

      // Skip profile query for now - focus on subscription data
      // try {
      //   console.log('SubscriptionContext: Querying profiles table...')
      //   const { data: profile, error: profileError } = await supabase
      //     .from('profiles')
      //     .select('full_name')
      //     .eq('id', currentUser.id)
      //     .single()

      //   console.log('SubscriptionContext: Profile query result:', profile, profileError)
      //   if (!profileError && profile) {
      //     setUserProfile(profile)
      //   }
      // } catch (e) {
      //   console.error('SubscriptionContext: Profile fetch error:', e)
      //   // Silent fallback to metadata
      // }

      // Fetch subscription data with fallback
      let planData = null
      let subData = null

      console.log('SubscriptionContext: Starting subscription queries...')

      try {
        console.log('SubscriptionContext: Calling getUserPlanInfo...')
        planData = await getUserPlanInfo(currentUser.id)
        console.log('SubscriptionContext: getUserPlanInfo result:', planData)
      } catch (e) {
        console.error('SubscriptionContext: getUserPlanInfo error:', e)
        // Silent fallback
      }

      try {
        console.log('SubscriptionContext: Fetching user_subscriptions for user:', currentUser.id)
        const { data } = await supabase.from('user_subscriptions').select('*').eq('user_id', currentUser.id).maybeSingle()
        console.log('SubscriptionContext: Subscription query result:', data)
        subData = data

        // If no subscription exists, create a trial automatically
        if (!subData) {
          console.log('No subscription found, creating trial for user:', currentUser.id)

          const { data: newTrial, error: trialError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: currentUser.id,
              plan_id: 'trial',
              whop_subscription_id: null,
              status: 'trial',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date('2099-12-31').toISOString(),
              videos_limit: 5,
              videos_used: 0
            })
            .select()
            .single()

          if (!trialError && newTrial) {
            console.log('Successfully created trial subscription:', newTrial)
            subData = newTrial
            // Refresh plan info with new subscription
            planData = await getUserPlanInfo(currentUser.id)
          } else {
            console.error('Failed to create trial subscription:', trialError)
          }
        } else {
          console.log('SubscriptionContext: Found existing subscription:', subData)
        }
      } catch (e) {
        console.error('Error fetching user subscription:', e)
        // Silent fallback
      }

      // Use planData from getUserPlanInfo if available, otherwise create fallback
      const finalPlanInfo = planData || {
        planName: 'Trial',
        planId: 'trial',
        status: 'trial',
        isActive: true,
        videosRemaining: 5,
        currentPeriodEnd: null
      }

      console.log('SubscriptionContext: Setting final planInfo:', finalPlanInfo)
      console.log('SubscriptionContext: Setting subscription data:', subData)

      setPlanInfo(finalPlanInfo)
      setSubscription(subData)
    } catch (error: any) {
      console.error('SubscriptionContext: Major error in fetchUserData:', error)
      // Set fallback plan info to allow basic functionality
      setPlanInfo({
        planName: 'Trial',
        planId: 'trial',
        status: 'trial',
        isActive: true,
        videosRemaining: 5,
        currentPeriodEnd: null
      })

      setSubscription(null)
    } finally {
      console.log('SubscriptionContext: fetchUserData completed, setting loading to false')
      setLoading(false)
    }
  }

  const refreshSubscription = async () => {
    if (user) {
      setLoading(true)
      await fetchUserData(user)
    }
  }

  const startFreeTrial = async (): Promise<boolean> => {
    if (!user) return false
    
    try {
      const newSubscription = await createUserTrial(user.id)
      if (newSubscription) {
        setSubscription(newSubscription)
        await refreshSubscription()
        return true
      }
    } catch (error) {
      console.error('Error starting free trial:', error)
    }
    
    return false
  }

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
        // Set fallback state on error
        setUser(null)
        setPlanInfo({
          planName: 'Trial',
          planId: 'trial',
          status: 'trial',
          isActive: true,
          videosRemaining: 5,
          currentPeriodEnd: null
        })
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        
        if (session?.user) {
          await fetchUserData(session.user)
        } else {
          setPlanInfo(null)
          setSubscription(null)
          setUserProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      authSubscription.unsubscribe()
    }
  }, [])

  const canCreateVideo = process.env.NODE_ENV === 'development' ? true : (
    planInfo?.isActive && (
      planInfo.videosRemaining === null || // Unlimited (paid plans)
      (planInfo.videosRemaining !== null && planInfo.videosRemaining > 0) // Trial with remaining videos
    )
  )


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
        startFreeTrial
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