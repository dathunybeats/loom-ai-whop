import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import ProspectsPageClient from './ProspectsPageClient'
import { Suspense } from 'react'
import { ProspectsListLoading } from '@/components/ui/loading-skeleton'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProspectsPage({ params }: PageProps) {
  const { id } = await params
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

  // Fetch prospects for this project
  const { data: prospects, error: prospectsError } = await supabase
    .from('prospects')
    .select('*')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (prospectsError) {
    console.error('Error fetching prospects:', prospectsError)
  }

  return (
    <Suspense fallback={<ProspectsListLoading />}>
      <ProspectsPageClient 
        project={project}
        initialProspects={prospects || []}
        user={user}
      />
    </Suspense>
  )
}