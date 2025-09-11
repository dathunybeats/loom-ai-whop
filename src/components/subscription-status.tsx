'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  UserSubscription, 
  getPlanById, 
  getVideoLimitRemaining, 
  isTrialExpired,
  formatPrice 
} from '@/lib/subscription'
import { Calendar, CreditCard, Video } from 'lucide-react'

interface SubscriptionStatusProps {
  subscription: UserSubscription
  onUpgrade?: () => void
}

export function SubscriptionStatus({ subscription, onUpgrade }: SubscriptionStatusProps) {
  const plan = getPlanById(subscription.planId)
  const videoLimitRemaining = getVideoLimitRemaining(subscription)
  const trialExpired = isTrialExpired(subscription)
  
  if (!plan) return null

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'trial':
        return trialExpired ? 
          <Badge variant="destructive">Trial Expired</Badge> :
          <Badge variant="secondary">Free Trial</Badge>
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTrialProgress = () => {
    if (subscription.status !== 'trial' || !plan.videoLimit) return null
    
    const videosUsed = subscription.trialVideosUsed || 0
    const progressPercentage = (videosUsed / plan.videoLimit) * 100
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1">
            <Video className="h-4 w-4" />
            Videos Used
          </span>
          <span>{videosUsed} / {plan.videoLimit}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {videoLimitRemaining} videos remaining in your trial
        </p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {plan.name} Plan
            </CardTitle>
            <CardDescription>
              {plan.price > 0 ? `${formatPrice(plan.price)}/month` : 'Free'}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {getTrialProgress()}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {subscription.status === 'trial' ? 'Trial' : 'Current period'} ends{' '}
            {subscription.currentPeriodEnd.toLocaleDateString()}
          </span>
        </div>

        {(trialExpired || subscription.status === 'expired') && onUpgrade && (
          <Button onClick={onUpgrade} className="w-full">
            Upgrade Plan
          </Button>
        )}

        {subscription.status === 'trial' && !trialExpired && onUpgrade && (
          <Button onClick={onUpgrade} variant="outline" className="w-full">
            Upgrade to Premium
          </Button>
        )}
      </CardContent>
    </Card>
  )
}