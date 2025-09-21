import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { SettingsPageClient } from './settings-client'
import { Suspense } from 'react'
import { SettingsPageSkeleton } from '@/components/ui/settings-skeleton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user data via server-side call
  let profile = null
  try {
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = userData
  } catch (error) {
    console.error('Error fetching user data:', error)
    // Profile will be null and SettingsPageClient will handle it
  }

  return (
    <DashboardLayout>
      <Suspense fallback={<SettingsPageSkeleton />}>
        <SettingsPageClient user={user} profile={profile} />
      </Suspense>
    </DashboardLayout>
  )
}