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

    // Show upgrade modal only for non-active subscriptions
    if (planInfo.status !== 'active') {
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