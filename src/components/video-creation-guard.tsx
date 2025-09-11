'use client'

import { useSubscription } from '@/contexts/SubscriptionContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Lock, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface VideoCreationGuardProps {
  children: ReactNode
  feature?: string
}

export function VideoCreationGuard({ children, feature = 'create videos' }: VideoCreationGuardProps) {
  const { planInfo, loading, canCreateVideo } = useSubscription()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Allow access if user can create videos
  if (canCreateVideo) {
    return <>{children}</>
  }

  // Show upgrade prompt
  const handleUpgrade = () => {
    router.push('/pricing')
  }

  const getRestrictionMessage = () => {
    if (!planInfo) {
      return {
        title: 'Get Started with Loom.ai',
        description: 'Choose a plan to start creating personalized videos',
        icon: Crown,
        variant: 'default' as const
      }
    }

    if (planInfo.planName === 'Free Trial' && planInfo.videosRemaining === 0) {
      return {
        title: 'Trial Videos Exhausted',
        description: `You've used all ${planInfo.planName === 'Free Trial' ? '5' : '0'} trial videos. Upgrade to continue creating unlimited videos.`,
        icon: AlertTriangle,
        variant: 'destructive' as const
      }
    }

    if (!planInfo.isActive) {
      return {
        title: 'Subscription Required',
        description: 'Your subscription has expired. Reactivate to continue creating videos.',
        icon: Lock,
        variant: 'destructive' as const
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
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              restriction.variant === 'destructive' 
                ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                : 'bg-primary/10 text-primary'
            }`}>
              <Icon className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-xl mb-2">{restriction.title}</CardTitle>
          <CardDescription className="text-center">
            {restriction.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {planInfo && planInfo.planName === 'Free Trial' && (
            <div className="bg-muted p-3 rounded-md">
              <div className="text-sm font-medium mb-1">Trial Status</div>
              <div className="flex items-center justify-between text-sm">
                <span>Videos Used:</span>
                <Badge variant="secondary">
                  {planInfo.videosRemaining !== null ? 5 - planInfo.videosRemaining : 0}/5
                </Badge>
              </div>
            </div>
          )}
          
          <Button onClick={handleUpgrade} className="w-full" size="lg">
            <Crown className="h-4 w-4 mr-2" />
            {planInfo?.planName === 'Free Trial' ? 'Upgrade Plan' : 'Choose Plan'}
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
    canCreateVideos: planInfo?.isActive && (
      planInfo.videosRemaining === null || 
      (planInfo.videosRemaining !== null && planInfo.videosRemaining > 0)
    ),
    canAccessAnalytics: planInfo?.planId !== null, // Paid plans only
    canUseBulkImport: ['plan_N97PuJswksstF', 'plan_HeStJKVzCFSSa'].includes(planInfo?.planId || ''), // Pro & Agency
    canUseWhiteLabel: planInfo?.planId === 'plan_HeStJKVzCFSSa', // Agency only
    canAccessAPI: ['plan_N97PuJswksstF', 'plan_HeStJKVzCFSSa'].includes(planInfo?.planId || ''), // Pro & Agency
    maxVideoQuality: planInfo?.planId === 'plan_N97PuJswksstF' || planInfo?.planId === 'plan_HeStJKVzCFSSa' ? '4K' : 'HD',
    hasUnlimitedTeamMembers: planInfo?.planId === 'plan_HeStJKVzCFSSa', // Agency only
    hasPrioritySupport: ['plan_N97PuJswksstF', 'plan_HeStJKVzCFSSa'].includes(planInfo?.planId || '')
  }
}