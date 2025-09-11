import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import ProjectPageClient from './ProjectPageClient'
import { Suspense } from 'react'
import { ProjectDetailLoading } from '@/components/ui/loading-skeleton'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch project and counts in parallel for optimized performance
  const [projectResult, prospectCountResult, videoCountResult] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, description, base_video_url, voice_sample_url, prospects_count, videos_generated, created_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id)
      .eq('user_id', user.id),
    supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id)
      .eq('user_id', user.id)
      .eq('video_status', 'completed')
  ])

  const { data: project, error } = projectResult
  const prospectCount = prospectCountResult.count || 0
  const videoCount = videoCountResult.count || 0

  if (error || !project) {
    redirect('/dashboard')
  }

  // Update project object with current counts
  const projectWithCounts = {
    ...project,
    prospects_count: prospectCount,
    videos_generated: videoCount
  }

  return (
    <DashboardLayout>
      <Suspense fallback={<ProjectDetailLoading />}>
        <ProjectPageClient project={projectWithCounts} user={user} />
      </Suspense>
    </DashboardLayout>
  )
}