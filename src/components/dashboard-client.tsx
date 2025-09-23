'use client'

import { useState, useEffect } from 'react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { UpgradeModal } from '@/components/upgrade-modal'

interface DashboardClientProps {
  children: React.ReactNode
}

export function DashboardClient({ children }: DashboardClientProps) {
  const { user, planInfo } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    if (!user || !planInfo) return

    // Only show upgrade modal when user actually needs to upgrade:
    // 1. Trial user with 0 videos remaining
    // 2. Paid subscription is inactive/expired (but not trial status)
    const needsUpgrade =
      (planInfo.status === 'trial' && planInfo.videosRemaining === 0) || // Trial exhausted
      (planInfo.status !== 'active' && planInfo.status !== 'trial') // Paid plan inactive

    if (needsUpgrade) {
      setShowUpgradeModal(true)
    }
  }, [user, planInfo])

  const handleUpgradeClose = () => {
    setShowUpgradeModal(false)
    // Refresh subscription data
    window.location.reload()
  }

  return (
    <>
      {children}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={handleUpgradeClose}
      />
    </>
  )
}