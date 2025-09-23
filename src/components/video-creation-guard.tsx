'use client'

import { useSubscription } from '@/contexts/SubscriptionContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Lock, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface VideoCreationGuardProps {
  children: ReactNode
  feature?: string
}

export function VideoCreationGuard({ children, feature = 'create videos' }: VideoCreationGuardProps) {
  // Always call hooks at the top level
  const { planInfo, loading, canCreateVideo } = useSubscription()
  const router = useRouter()
  const [fallbackLoading, setFallbackLoading] = useState(true)

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setFallbackLoading(false)
    }, 15000) // 15 second fallback timeout

    return () => clearTimeout(fallbackTimer)
  }, [])

  // IMMEDIATE: Bypass guard completely in development - after hooks are called
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>
  }

  if (loading && fallbackLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Allow access in development or when user can create videos
  if (canCreateVideo ||
      (!loading && !fallbackLoading && planInfo?.isActive) ||
      process.env.NODE_ENV !== 'production') {
    return <>{children}</>
  }

  // Show upgrade prompt
  const handleUpgrade = () => {
    router.push('/pricing')
  }

  const getRestrictionMessage = () => {
    if (!planInfo || !planInfo.isActive) {
      return {
        title: 'Subscription Required',
        description: 'Choose a plan to start creating unlimited personalized videos with advanced features.',
        icon: Crown,
        variant: 'default' as const
      }
    }

    return {
      title: 'Upgrade Required',
      description: `You need an active subscription to ${feature}.`,
      icon: Crown,
      variant: 'default' as const
    }
  }

  const restriction = getRestrictionMessage()
  const Icon = restriction.icon

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 text-primary">
              <Icon className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-xl mb-2">{restriction.title}</CardTitle>
          <CardDescription className="text-center">
            {restriction.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleUpgrade} className="w-full" size="lg">
            <Crown className="h-4 w-4 mr-2" />
            Choose Plan
          </Button>

          <p className="text-xs text-muted-foreground">
            All plans include unlimited video creation and advanced features
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for checking specific plan features
export function usePlanFeatures() {
  const { planInfo } = useSubscription()
  
  return {
    canCreateVideos: planInfo?.isActive,
    canAccessAnalytics: planInfo?.planId !== null, // Paid plans only
    canUseBulkImport: ['plan_N97PuJswksstF', 'plan_HeStJKVzCFSSa'].includes(planInfo?.planId || ''), // Pro & Agency
    canUseWhiteLabel: planInfo?.planId === 'plan_HeStJKVzCFSSa', // Agency only
    canAccessAPI: ['plan_N97PuJswksstF', 'plan_HeStJKVzCFSSa'].includes(planInfo?.planId || ''), // Pro & Agency
    maxVideoQuality: planInfo?.planId === 'plan_N97PuJswksstF' || planInfo?.planId === 'plan_HeStJKVzCFSSa' ? '4K' : 'HD',
    hasUnlimitedTeamMembers: planInfo?.planId === 'plan_HeStJKVzCFSSa', // Agency only
    hasPrioritySupport: ['plan_N97PuJswksstF', 'plan_HeStJKVzCFSSa'].includes(planInfo?.planId || '')
  }
}