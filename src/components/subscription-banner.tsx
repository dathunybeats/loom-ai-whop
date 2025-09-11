'use client'

import { useSubscription } from '@/contexts/SubscriptionContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Crown, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SubscriptionBanner() {
  const { planInfo, loading, canCreateVideo } = useSubscription()
  const router = useRouter()

  if (loading || !planInfo) {
    return null
  }

  // Don't show banner for active paid plans
  if (planInfo.isActive && planInfo.videosRemaining === null) {
    return null
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  // Trial running out or no plan
  if (planInfo.planName === 'Free Trial') {
    const progressPercentage = planInfo.videosRemaining !== null 
      ? ((5 - planInfo.videosRemaining) / 5) * 100 
      : 100

    return (
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">Free Trial Active</span>
                <Badge variant="secondary">{planInfo.videosRemaining} videos left</Badge>
              </div>
              <div className="w-48">
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          </div>
          <Button onClick={handleUpgrade} size="sm">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>
    )
  }

  // No active plan or expired
  if (!planInfo.isActive || planInfo.planName === 'No Plan') {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <span className="font-medium">No Active Plan</span>
              <p className="text-sm text-muted-foreground">
                Subscribe to create videos and access all features
              </p>
            </div>
          </div>
          <Button onClick={handleUpgrade} size="sm">
            <Crown className="h-4 w-4 mr-2" />
            Choose Plan
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}

export function SubscriptionStatusCard() {
  const { planInfo, loading, subscription } = useSubscription()
  const router = useRouter()

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!planInfo) {
    return null
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  const getStatusIcon = () => {
    if (planInfo.isActive) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    return <AlertCircle className="h-5 w-5 text-red-600" />
  }

  const getStatusBadge = () => {
    if (planInfo.planName === 'Free Trial') {
      return <Badge variant="secondary">Free Trial</Badge>
    }
    if (planInfo.isActive) {
      return <Badge variant="default">Active</Badge>
    }
    return <Badge variant="destructive">Inactive</Badge>
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-lg">{planInfo.planName}</h3>
              {getStatusBadge()}
            </div>
          </div>
          {!planInfo.isActive || planInfo.planName === 'Free Trial' ? (
            <Button onClick={handleUpgrade} size="sm" variant="outline">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          ) : null}
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          {planInfo.videosRemaining !== null && (
            <div className="flex justify-between">
              <span>Videos Remaining:</span>
              <span className="font-medium">{planInfo.videosRemaining}</span>
            </div>
          )}
          
          {planInfo.videosRemaining === null && planInfo.isActive && (
            <div className="flex justify-between">
              <span>Videos:</span>
              <span className="font-medium text-green-600">Unlimited</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-medium capitalize">{planInfo.status}</span>
          </div>

          {planInfo.currentPeriodEnd && (
            <div className="flex justify-between">
              <span>{planInfo.planName === 'Free Trial' ? 'Trial Ends:' : 'Next Billing:'}</span>
              <span className="font-medium">{formatDate(planInfo.currentPeriodEnd)}</span>
            </div>
          )}
        </div>

        {planInfo.planName === 'Free Trial' && planInfo.videosRemaining !== null && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Trial Progress</span>
              <span>{5 - planInfo.videosRemaining}/5 videos used</span>
            </div>
            <Progress 
              value={((5 - planInfo.videosRemaining) / 5) * 100} 
              className="h-2" 
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}