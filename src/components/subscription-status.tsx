"use client"

import { useState } from "react"
import Link from "next/link"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Crown, Zap, AlertCircle, Calendar, Video } from "lucide-react"
import { UpgradeModal } from "@/components/upgrade-modal"

export function SubscriptionStatus() {
  const { planInfo, loading, user } = useSubscription()
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)

  if (loading || !planInfo) {
    return (
      <div className="px-3 py-2">
        <div className="animate-pulse bg-muted rounded h-16 w-full" />
      </div>
    )
  }

  // Calculate days remaining for trial
  const calculateDaysRemaining = () => {
    if (!planInfo.currentPeriodEnd) return null
    const endDate = new Date(planInfo.currentPeriodEnd)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const daysRemaining = calculateDaysRemaining()
  const isTrial = planInfo.planName === 'Free Trial'
  const isExpired = !planInfo.isActive
  const videosUsed = planInfo.videosRemaining !== null ? 5 - planInfo.videosRemaining : 0
  const totalVideos = planInfo.videosRemaining !== null ? 5 : null

  // Determine display content
  const getStatusContent = () => {
    if (isExpired) {
      return {
        badge: { text: "Expired", variant: "destructive" as const, icon: AlertCircle },
        title: "Plan Expired",
        subtitle: "Upgrade to continue",
        showUpgrade: true,
        showProgress: false
      }
    }

    if (isTrial) {
      return {
        badge: { text: "Free Trial", variant: "secondary" as const, icon: Zap },
        title: daysRemaining !== null ? `${daysRemaining} days left` : "Free Trial",
        subtitle: totalVideos ? `${videosUsed}/${totalVideos} videos used` : "Unlimited videos",
        progress: totalVideos ? (videosUsed / totalVideos) * 100 : null,
        showUpgrade: true,
        showProgress: totalVideos !== null
      }
    }

    // Paid plan
    return {
      badge: { text: planInfo.planName, variant: "default" as const, icon: Crown },
      title: "Active Plan", 
      subtitle: totalVideos ? `${videosUsed} videos used this month` : "Unlimited videos",
      progress: null, // Paid plans typically don't show progress
      showUpgrade: false,
      showProgress: false
    }
  }

  const status = getStatusContent()

  return (
    <div className="px-3 py-2 border-b border-sidebar-border">
      <div className="space-y-2.5">
        {/* Badge */}
        <div className="flex items-center justify-between">
          <Badge variant={status.badge.variant} className="text-xs px-2 py-0.5">
            <status.badge.icon className="h-3 w-3 mr-1" />
            {status.badge.text}
          </Badge>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-0.5">
          <p className="text-sm font-medium leading-none">{status.title}</p>
          <p className="text-xs text-muted-foreground leading-none">{status.subtitle}</p>
        </div>

        {/* Progress Bar */}
        {status.showProgress && status.progress !== null && (
          <div className="space-y-1">
            <Progress 
              value={status.progress} 
              className="h-1.5" 
            />
          </div>
        )}

        {/* Trial Period Info */}
        {isTrial && daysRemaining !== null && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Trial ends in {daysRemaining} days</span>
          </div>
        )}

        {/* Upgrade Button */}
        {status.showUpgrade && (
          <Button 
            onClick={() => setIsUpgradeModalOpen(true)}
            size="sm" 
            className="w-full text-xs h-7"
          >
            <Crown className="h-3 w-3 mr-1" />
            Upgrade Plan
          </Button>
        )}
      </div>
      
      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  )
}