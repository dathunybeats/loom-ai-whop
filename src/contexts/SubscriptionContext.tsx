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
    // Prevent redundant fetches for the same user within 30 seconds
    const now = Date.now()
    const CACHE_DURATION = 30000 // 30 seconds

    if (currentUser.id === currentUserId && now - lastFetchTime < CACHE_DURATION) {
      console.log('🚀 Using cached data, skipping fetch')
      setLoading(false)
      return
    }

    setCurrentUserId(currentUser.id)
    setLastFetchTime(now)

    try {
      // First, immediately set profile data from user metadata if available
      if (currentUser.user_metadata?.full_name) {
        setUserProfile({ full_name: currentUser.user_metadata.full_name })
      }

      // Remove timeout promises - let queries complete naturally
      
      // Fetch profile first (fastest), then other data
      try {
        console.log('🔍 Fetching profile for user:', currentUser.id)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', currentUser.id)
          .single()

        if (profileError) {
          console.error('❌ Profile fetch error:', profileError)
          console.log('Profile not found, will use metadata fallback')
        } else if (profile) {
          console.log('✅ Profile found:', profile)
          setUserProfile(profile)
        }
      } catch (e) {
        console.error('❌ Profile fetch exception:', e)
        console.log('Profile fetch failed, using fallback')
      }

      // Fetch subscription data with fallback
      let planData = null
      let subData = null

      try {
        planData = await getUserPlanInfo(currentUser.id)
      } catch (e) {
        console.log('Plan data fetch failed')
      }

      try {
        const { data } = await supabase.from('user_subscriptions').select('*').eq('user_id', currentUser.id).single()
        subData = data
      } catch (e) {
        console.log('Subscription data fetch failed')
      }

      setPlanInfo(planData || {
        planName: 'Free Trial',
        planId: null,
        status: 'trialing',
        isActive: true,
        videosRemaining: 5,
        currentPeriodEnd: null
      })
      setSubscription(subData)
    } catch (error: any) {
      console.warn('User data fetch error:', error.message)
      
      // Set fallback plan info to allow basic functionality
      setPlanInfo({
        planName: 'Free Trial',
        planId: null,
        status: 'trialing',
        isActive: true,
        videosRemaining: 5,
        currentPeriodEnd: null
      })
      
      setSubscription(null)
    } finally {
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
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)
        
        if (currentUser) {
          await fetchUserData(currentUser)
        } else {
          console.log('No authenticated user, skipping subscription fetch')
          setLoading(false)
        }
      } catch (error: any) {
        console.warn('Auth initialization error:', error.message)
        
        // Set fallback state on error
        setUser(null)
        setPlanInfo({
          planName: 'Free Trial',
          planId: null,
          status: 'trialing',
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

  const canCreateVideo = planInfo?.isActive && (
    planInfo.videosRemaining === null || // Unlimited (paid plans)
    (planInfo.videosRemaining !== null && planInfo.videosRemaining > 0) // Trial with remaining videos
  ) || false

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