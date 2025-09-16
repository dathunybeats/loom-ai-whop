'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, createContext, useContext, ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Persistent auth state using localStorage
const AUTH_STORAGE_KEY = 'loom_auth_state'

function getStoredAuthState(): AuthState | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) return null

    const parsed = JSON.parse(stored)

    // Check if stored data is recent (within 1 hour)
    const now = Date.now()
    const storedTime = parsed.timestamp || 0
    const maxAge = 60 * 60 * 1000 // 1 hour

    if (now - storedTime > maxAge) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    return {
      user: parsed.user,
      loading: false,
      error: null
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

function storeAuthState(user: User | null) {
  if (typeof window === 'undefined') return

  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      user,
      timestamp: Date.now()
    }))
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize with stored state if available
    const stored = getStoredAuthState()
    return stored || { user: null, loading: true, error: null }
  })

  const supabase = createClient()

  const updateAuthState = (newState: AuthState) => {
    setAuthState(newState)
    storeAuthState(newState.user)
  }

  const checkUser = async () => {
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
      console.error('Auth check error:', err)
      const errorState: AuthState = {
        user: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Auth check failed'
      }

      updateAuthState(errorState)
      return errorState
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      updateAuthState({ user: null, loading: false, error: null })
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  const refreshAuth = async () => {
    await checkUser()
  }

  useEffect(() => {
    // Only check auth if we don't have valid stored state
    const storedState = getStoredAuthState()
    if (!storedState) {
      checkUser()
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)

        const newState: AuthState = {
          user: session?.user || null,
          loading: false,
          error: null
        }
        updateAuthState(newState)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value: AuthContextType = {
    ...authState,
    signOut,
    refreshAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}