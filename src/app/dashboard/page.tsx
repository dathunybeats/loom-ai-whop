import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProjectCard } from '@/components/project-card'
import { SubscriptionBanner } from '@/components/subscription-banner'
import { Suspense } from 'react'
import { DashboardStatsLoading, ProjectsGridLoading, RecentCampaignsLoading } from '@/components/ui/loading-skeleton'

// Optimized data fetching with parallel queries
async function getDashboardData(userId: string) {
  const supabase = await createClient()
  
  // Parallel data fetching for better performance
  const [projectsResult, statsResult] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, description, base_video_url, voice_sample_url, prospects_count, videos_generated, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    
    supabase
      .from('projects')
      .select('prospects_count, videos_generated')
      .eq('user_id', userId)
  ])

  const projects = projectsResult.data || []
  const statsData = statsResult.data || []
  
  // Calculate analytics efficiently
  const analytics = statsData.reduce(
    (acc, project) => ({
      totalProjects: acc.totalProjects + 1,
      totalProspects: acc.totalProspects + (project.prospects_count || 0),
      totalVideos: acc.totalVideos + (project.videos_generated || 0),
    }),
    { totalProjects: 0, totalProspects: 0, totalVideos: 0 }
  )

  return {
    projects,
    analytics: {
      ...analytics,
      avgVideosPerProject: analytics.totalProjects > 0 
        ? Math.round(analytics.totalVideos / analytics.totalProjects) 
        : 0
    },
    error: projectsResult.error
  }
}

export default async function Dashboard({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Await searchParams in Next.js 15
  const params = await searchParams

  // If user came from successful upgrade, redirect to upgrade-success page
  const upgraded = params.upgraded
  if (upgraded === 'true') {
    const urlParams = new URLSearchParams()
    
    // Preserve all query parameters from the original URL
    Object.entries(params).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        urlParams.set(key, value)
      }
    })
    
    redirect(`/dashboard/upgrade-success?${urlParams.toString()}`)
  }

  const { projects, analytics, error } = await getDashboardData(user.id)

  if (error) {
    console.error('Error fetching projects:', error)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <Link 
            href="/projects/new"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Create New Project
          </Link>
        </div>

        {/* Subscription Status Banner */}
        <SubscriptionBanner />

        {/* Analytics Section */}
        <Suspense fallback={<DashboardStatsLoading />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.totalProjects}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Prospects</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.totalProspects}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Videos Generated</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.totalVideos}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg per Project</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.avgVideosPerProject}</p>
                </div>
              </div>
            </div>
          </div>
        </Suspense>

        {/* Recent Campaigns Section */}
        <Suspense fallback={<RecentCampaignsLoading />}>
          <div className="bg-card border border-border rounded-lg">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recent Campaigns</h2>
                <Link href="/campaigns" className="text-sm text-primary hover:text-primary/80">
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-border">
              {projects?.slice(0, 5).map((project) => (
                <div key={project.id} className="p-6 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          project.base_video_url ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.prospects_count} prospects • {project.videos_generated} videos generated
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="p-6 text-center text-muted-foreground">
                  <p>No campaigns yet. Create your first project to get started!</p>
                </div>
              )}
            </div>
          </div>
        </Suspense>
          
        {/* Projects Section */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">All Projects</h2>
          <Suspense fallback={<ProjectsGridLoading />}>
            {projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
            <div className="bg-card border border-border overflow-hidden rounded-lg">
              <div className="px-6 py-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-card-foreground mb-3">
                    Welcome to Loom.ai
                  </h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Create personalized video outreach campaigns with AI-powered voice cloning and automated prospect targeting
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-accent/50 border border-border p-6 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                        1
                      </div>
                      <h4 className="font-medium text-accent-foreground">Upload Base Video</h4>
                    </div>
                    <p className="text-sm text-muted-foreground ml-11">Upload your talking head video with [FIRST_NAME] placeholder</p>
                  </div>
                  
                  <div className="bg-accent/50 border border-border p-6 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                        2
                      </div>
                      <h4 className="font-medium text-accent-foreground">Add Prospects</h4>
                    </div>
                    <p className="text-sm text-muted-foreground ml-11">Upload a CSV with prospect names and contact info</p>
                  </div>
                  
                  <div className="bg-accent/50 border border-border p-6 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                        3
                      </div>
                      <h4 className="font-medium text-accent-foreground">Generate Videos</h4>
                    </div>
                    <p className="text-sm text-muted-foreground ml-11">AI creates personalized videos for each prospect</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Link 
                    href="/projects/new"
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Project
                  </Link>
                </div>
              </div>
            </div>
            )}
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  )
}