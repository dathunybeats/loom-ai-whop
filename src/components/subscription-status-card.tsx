'use client'

import { useSubscription } from '@/contexts/SubscriptionContext'
import { Crown, Video, Zap, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

export function SubscriptionStatusCard() {
  const { planInfo, loading } = useSubscription()
  const router = useRouter()
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const prevVideosUsedRef = useRef<number | undefined>(undefined)
  const isFirstLoadRef = useRef(true)

  useEffect(() => {
    if (planInfo?.status === 'trial' && planInfo?.videosUsed !== undefined) {
      const currentVideosUsed = planInfo.videosUsed

      // Animate on first load or when number increases
      if (isFirstLoadRef.current || (prevVideosUsedRef.current !== undefined && currentVideosUsed > prevVideosUsedRef.current)) {
        setShouldAnimate(true)
        isFirstLoadRef.current = false
      }

      prevVideosUsedRef.current = currentVideosUsed
    }
  }, [planInfo?.videosUsed, planInfo?.status])

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  if (loading) {
    return (
      <div className="p-3 mx-2 mb-2 bg-black/5 rounded-xl border border-black/10">
        <div className="animate-pulse space-y-1">
          <div className="h-3 bg-black/20 rounded w-16"></div>
          <div className="h-1.5 bg-black/20 rounded w-full"></div>
          <div className="h-2 bg-black/20 rounded w-12"></div>
        </div>
      </div>
    )
  }

  if (!planInfo) {
    return null
  }

  // Active paid subscription (not trial)
  if (planInfo.status === 'active' && planInfo.planId !== 'trial') {
    return (
      <div className="p-2 mx-2 mb-1 bg-black/5 border border-black/10 rounded-xl">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Crown className="h-3 w-3 text-black" />
            <span className="font-medium text-black text-xs">{planInfo.planName}</span>
          </div>
          <span className="text-xs font-medium text-black/70 bg-black/10 px-1.5 py-0.5 rounded">
            Active
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-black/70">
          <Video className="h-2.5 w-2.5" />
          <span className="text-xs">Unlimited videos</span>
        </div>
      </div>
    )
  }

  // Trial user with videos remaining
  if (planInfo.status === 'trial' && planInfo.videosRemaining && planInfo.videosRemaining > 0) {
    const totalVideos = planInfo.videosLimit || 5
    const videosUsed = planInfo.videosUsed || 0

    return (
      <div className="p-2 mx-2 mb-1 bg-black/5 border border-black/10 rounded-xl">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-black" />
            <span className="font-medium text-black text-xs">Free Trial</span>
          </div>
          <span className="text-xs font-medium text-black/70 bg-black/10 px-1.5 py-0.5 rounded">
            {planInfo.videosRemaining} left
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-black/70">
            <span>Videos used</span>
            <span className="font-medium">{videosUsed}/{totalVideos}</span>
          </div>
          <div className="w-full h-1 bg-black/10 rounded-full overflow-hidden">
            <div
              className={`h-full bg-black rounded-full ${shouldAnimate ? 'transition-all duration-1000 ease-out' : ''}`}
              style={{ width: `${(videosUsed / totalVideos) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          className="w-full mt-2 text-xs bg-black hover:bg-black/80 text-white py-1.5 px-2 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Crown className="h-2.5 w-2.5" />
          Upgrade Plan
        </button>
      </div>
    )
  }

  // Trial exhausted or inactive subscription
  const isTrialExhausted = planInfo.status === 'trial' && (planInfo.videosRemaining === 0 || planInfo.videosRemaining === null)
  const isInactive = planInfo.status !== 'active' && planInfo.status !== 'trial'

  if (isTrialExhausted || isInactive) {
    return (
      <div className="p-2 mx-2 mb-1 bg-black/5 border border-black/10 rounded-xl">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-black" />
            <span className="font-medium text-black text-xs">
              {isTrialExhausted ? "Trial Complete" : "Expired"}
            </span>
          </div>
        </div>

        <p className="text-xs text-black/70 mb-2">
          {isTrialExhausted
            ? "Upgrade to continue creating videos"
            : "Reactivate your subscription"
          }
        </p>

        <button
          onClick={handleUpgrade}
          className="w-full text-xs bg-black hover:bg-black/80 text-white py-1.5 px-2 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Crown className="h-2.5 w-2.5" />
          Upgrade Now
        </button>
      </div>
    )
  }

  // Fallback
  return (
    <div className="p-3 mx-2 mb-2 bg-black/5 rounded-xl border border-black/10">
      <div className="flex items-center gap-1.5 text-black/70">
        <Video className="h-3 w-3" />
        <span className="text-xs">Loading status...</span>
      </div>
    </div>
  )
}