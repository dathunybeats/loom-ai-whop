import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProjectCard } from '@/components/project-card'
import { Suspense } from 'react'
import { ProjectsGridLoading } from '@/components/ui/loading-skeleton'
import { Button } from '@/components/ui/button'
import { Plus, FolderOpen } from 'lucide-react'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's projects with optimized query
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, description, base_video_url, voice_sample_url, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground">
              Manage your video personalization projects
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Projects Grid */}
        <Suspense fallback={<ProjectsGridLoading />}>
          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <FolderOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No projects yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Create your first project to start generating personalized videos for your prospects.
              </p>
              <Link href="/projects/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
          )}
        </Suspense>

        {/* Quick Stats (Simple, no complex analytics) */}
        {projects && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{projects.length}</div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {projects.filter(project => project.base_video_url).length}
              </div>
              <div className="text-sm text-muted-foreground">Projects with Videos</div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}