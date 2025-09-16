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
  const { user, planInfo, loading } = useSubscription()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [showTrialModal, setShowTrialModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  // Check URL parameters for post-payment redirect
  const upgraded = searchParams.get('upgraded')

  // Helper function to check if user has completed trial onboarding
  const hasCompletedTrialOnboarding = () => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(`trial_completed_${user?.id}`) === 'true'
  }

  // No fallback fetch; rely on initialPlan (server-provided) or context

  useEffect(() => {
    if (!user) return

    // Debug logging
    console.log('DashboardClient Debug:', {
      loading,
      user: user?.id,
      planInfo,
      upgraded,
      planStatus: planInfo?.status,
      videosRemaining: planInfo?.videosRemaining,
      planName: planInfo?.planName
    })

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
      console.log('DashboardClient: Waiting for plan info (context or fallback)...')
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
      // Paid users: show welcome once if not yet welcomed
      const welcomedAt = (effectivePlan as any).welcomedAt ?? null
      if (!welcomedAt) {
        setShowWelcomeModal(true)
      }
      return
    }

    if (isTrial) {
      if (hasRemainingTrialVideos) {
        console.log('Showing trial modal - trial user has remaining videos:', { videosRemaining })
        setShowTrialModal(true)
      } else {
        console.log('Showing upgrade modal - trial limit reached')
        setShowUpgradeModal(true)
      }
      return
    }

    // Other non-active statuses (cancelled/expired): show upgrade
    console.log('Showing upgrade modal - status is not active:', { status: effectivePlan.status })
    setShowUpgradeModal(true)
  }, [user, planInfo, initialPlan, loading, upgraded, router])

  const handleTrialComplete = () => {
    setShowTrialModal(false)
    // Mark trial onboarding as completed
    if (user?.id) {
      localStorage.setItem(`trial_completed_${user.id}`, 'true')
    }
    setShowUpgradeModal(true)
  }

  const handleUpgradeClose = () => {
    setShowUpgradeModal(false)
    // Refresh subscription data
    window.location.reload()
  }

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false)
    // Mark welcomed on server (best-effort)
    try {
      fetch('/api/subscription/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ welcomed: true })
      })
    } catch {}
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