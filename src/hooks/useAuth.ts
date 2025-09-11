'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// Cache auth state globally to avoid repeated checks
let authCache: AuthState | null = null
let cacheExpiry = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Return cached state if still valid
    if (authCache && Date.now() < cacheExpiry) {
      return authCache
    }
    return { user: null, loading: true, error: null }
  })

  const supabase = useMemo(() => createClient(), [])

  const updateAuthState = useCallback((newState: AuthState) => {
    authCache = newState
    cacheExpiry = Date.now() + CACHE_DURATION
    setAuthState(newState)
  }, [])

  const checkUser = useCallback(async () => {
    // Return cached state if still valid
    if (authCache && Date.now() < cacheExpiry && !authCache.loading) {
      return authCache
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      const newState: AuthState = {
        user,
        loading: false,
        error: error?.message || null
      }
      
      updateAuthState(newState)
      return newState
    } catch (err) {
      const errorState: AuthState = {
        user: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Auth check failed'
      }
      
      updateAuthState(errorState)
      return errorState
    }
  }, [supabase, updateAuthState])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      const signedOutState: AuthState = { user: null, loading: false, error: null }
      updateAuthState(signedOutState)
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }, [supabase, updateAuthState])

  useEffect(() => {
    // Only check auth if cache is expired or invalid
    if (!authCache || Date.now() >= cacheExpiry || authCache.loading) {
      checkUser()
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newState: AuthState = {
          user: session?.user || null,
          loading: false,
          error: null
        }
        updateAuthState(newState)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, checkUser, updateAuthState])

  return {
    ...authState,
    signOut,
    refreshAuth: checkUser
  }
}