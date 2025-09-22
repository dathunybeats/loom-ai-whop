'use client'

import { useState, useEffect } from 'react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { TrialModal } from '@/components/trial-modal'
import { TrialUpgradeModal } from '@/components/trial-upgrade-modal'
import { WelcomeModal } from '@/components/welcome-modal'

interface DashboardClientProps {
  children: React.ReactNode
  initialPlan?: {
    status: string
    videosRemaining: number | null
    planName?: string
    welcomedAt?: string | null
  }
}

export function DashboardClient({ children, initialPlan }: DashboardClientProps) {
  const { user, userData, planInfo, loading } = useSubscription()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [showTrialModal, setShowTrialModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  // Check URL parameters for post-payment redirect
  const upgraded = searchParams.get('upgraded')

  // No fallback fetch; rely on initialPlan (server-provided) or context

  useEffect(() => {
    if (!user) return

    // Debug logging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('DashboardClient Debug:', {
        loading,
        user: user?.id,
        planInfo,
        upgraded,
        planStatus: planInfo?.status,
        videosRemaining: planInfo?.videosRemaining,
        planName: planInfo?.planName
      })
    }

    // Handle post-payment welcome modal (via redirect param)
    if (upgraded === 'true' && planInfo?.status === 'active') {
      setShowWelcomeModal(true)
      // Clean up URL
      const url = new URL(window.location.href)
      url.searchParams.delete('upgraded')
      router.replace(url.pathname + url.search, { scroll: false })
      return
    }

    // Use planInfo if available; otherwise initialPlan from server
    const effectivePlan = planInfo || initialPlan

    // If still neither, wait
    if (!effectivePlan) {
      if (process.env.NODE_ENV === 'development') {
        console.log('DashboardClient: Waiting for plan info (context or fallback)...')
      }
      return
    }

    // Decide which modal to show based on subscription status and usage (planInfo is present here)
    const isPaid = effectivePlan.status === 'active'
    const isTrial = effectivePlan.status === 'trial'
    const videosRemaining = effectivePlan.videosRemaining
    const hasRemainingTrialVideos = videosRemaining !== null && videosRemaining > 0

    // Reset both before setting the correct one
    setShowTrialModal(false)
    setShowUpgradeModal(false)

    if (isPaid) {
      // Paid users: show welcome once if onboarding not completed
      const onboardingCompleted = userData?.onboarding_completed ?? false
      if (!onboardingCompleted) {
        setShowWelcomeModal(true)
      }
      return
    }

    if (isTrial) {
      if (hasRemainingTrialVideos) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Showing trial modal - trial user has remaining videos:', { videosRemaining })
        }
        setShowTrialModal(true)
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('Showing upgrade modal - trial limit reached')
        }
        setShowUpgradeModal(true)
      }
      return
    }

    // Other non-active statuses (cancelled/expired): show upgrade
    if (process.env.NODE_ENV === 'development') {
      console.log('Showing upgrade modal - status is not active:', { status: effectivePlan.status })
    }
    setShowUpgradeModal(true)
  }, [user, planInfo, initialPlan, loading, upgraded, router])

  const handleTrialComplete = () => {
    setShowTrialModal(false)
    setShowUpgradeModal(true)
  }

  const handleUpgradeClose = () => {
    setShowUpgradeModal(false)
    // Refresh subscription data
    window.location.reload()
  }

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false)
    // The WelcomeModal will handle updating the onboarding status via its own API call
  }

  return (
    <>
      {children}

      <TrialModal
        isOpen={showTrialModal}
        onClose={() => {}} // Can't close without completing trial
        onUpgrade={handleTrialComplete}
      />

      <TrialUpgradeModal
        isOpen={showUpgradeModal}
        onClose={handleUpgradeClose}
      />

      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeClose}
        planName={planInfo?.planName}
      />

    </>
  )
}