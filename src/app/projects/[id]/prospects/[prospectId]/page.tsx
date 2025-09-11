import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import ProspectPageClient from './ProspectPageClient'
import { Suspense } from 'react'
import { ProspectDetailLoading } from '@/components/ui/loading-skeleton'

interface PageProps {
  params: Promise<{
    id: string
    prospectId: string
  }>
}

export default async function ProspectPage({ params }: PageProps) {
  const { id, prospectId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Fetch prospect details
  const { data: prospect, error: prospectError } = await supabase
    .from('prospects')
    .select('*')
    .eq('id', prospectId)
    .eq('project_id', id)
    .eq('user_id', user.id)
    .single()

  if (prospectError || !prospect) {
    notFound()
  }

  return (
    <Suspense fallback={<ProspectDetailLoading />}>
      <ProspectPageClient 
        project={project}
        prospect={prospect}
        user={user}
      />
    </Suspense>
  )
}