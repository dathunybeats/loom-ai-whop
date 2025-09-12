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
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchUserData = async (currentUser: User) => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Subscription fetch timeout')), 10000) // 10 second timeout
      })
      
      const planDataPromise = getUserPlanInfo(currentUser.id)
      const planData = await Promise.race([planDataPromise, timeoutPromise]) as any
      setPlanInfo(planData)
      
      // Fetch detailed subscription data with timeout
      const subDataPromise = supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', currentUser.id)
        .single()
      
      const { data: subData } = await Promise.race([subDataPromise, timeoutPromise]) as any
      setSubscription(subData)
    } catch (error: any) {
      console.warn('Subscription service timeout, using fallback state:', error.message)
      
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
        // Add timeout to auth initialization
        const authTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth initialization timeout')), 8000) // 8 second timeout
        })
        
        const authPromise = supabase.auth.getUser()
        const { data: { user: currentUser } } = await Promise.race([authPromise, authTimeout]) as any
        setUser(currentUser)
        
        if (currentUser) {
          await fetchUserData(currentUser)
        } else {
          console.log('No authenticated user, skipping subscription fetch')
          setLoading(false)
        }
      } catch (error: any) {
        console.warn('Auth service timeout, using fallback state:', error.message)
        
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