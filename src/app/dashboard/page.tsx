import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DashboardClient } from '@/components/dashboard-client'
import { ProjectCard } from '@/components/project-card'
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
      <DashboardClient>
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
        {/* <SubscriptionBanner /> */}

        {/* Analytics Section */}
        <Suspense fallback={<DashboardStatsLoading />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none">
                      <path d="M13 7L11.8845 4.76892C11.5634 4.1268 11.4029 3.80573 11.1634 3.57116C10.9516 3.36373 10.6963 3.20597 10.4161 3.10931C10.0992 3 9.74021 3 9.02229 3H5.2C4.0799 3 3.51984 3 3.09202 3.21799C2.71569 3.40973 2.40973 3.71569 2.21799 4.09202C2 4.51984 2 5.0799 2 6.2V7M2 7H17.2C18.8802 7 19.7202 7 20.362 7.32698C20.9265 7.6146 21.3854 8.07354 21.673 8.63803C22 9.27976 22 10.1198 22 11.8V16.2C22 17.8802 22 18.7202 21.673 19.362C21.3854 19.9265 20.9265 20.3854 20.362 20.673C19.7202 21 18.8802 21 17.2 21H6.8C5.11984 21 4.27976 21 3.63803 20.673C3.07354 20.3854 2.6146 19.9265 2.32698 19.362C2 18.7202 2 17.8802 2 16.2V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none">
                      <path d="M5.3163 19.4384C5.92462 18.0052 7.34492 17 9 17H15C16.6551 17 18.0754 18.0052 18.6837 19.4384M16 9.5C16 11.7091 14.2091 13.5 12 13.5C9.79086 13.5 8 11.7091 8 9.5C8 7.29086 9.79086 5.5 12 5.5C14.2091 5.5 16 7.29086 16 9.5ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none">
                      <path d="M22 8.93137C22 8.32555 22 8.02265 21.8802 7.88238C21.7763 7.76068 21.6203 7.69609 21.4608 7.70865C21.2769 7.72312 21.0627 7.93731 20.6343 8.36569L17 12L20.6343 15.6343C21.0627 16.0627 21.2769 16.2769 21.4608 16.2914C21.6203 16.3039 21.7763 16.2393 21.8802 16.1176C22 15.9774 22 15.6744 22 15.0686V8.93137Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 9.8C2 8.11984 2 7.27976 2.32698 6.63803C2.6146 6.07354 3.07354 5.6146 3.63803 5.32698C4.27976 5 5.11984 5 6.8 5H12.2C13.8802 5 14.7202 5 15.362 5.32698C15.9265 5.6146 16.3854 6.07354 16.673 6.63803C17 7.27976 17 8.11984 17 9.8V14.2C17 15.8802 17 16.7202 16.673 17.362C16.3854 17.9265 15.9265 18.3854 15.362 18.673C14.7202 19 13.8802 19 12.2 19H6.8C5.11984 19 4.27976 19 3.63803 18.673C3.07354 18.3854 2.6146 17.9265 2.32698 17.362C2 16.7202 2 15.8802 2 14.2V9.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none">
                      <path d="M8 13V17M16 11V17M12 7V17M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <Link href="/projects" className="text-sm text-black hover:text-black/80 font-normal">
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
                        <p className="text-sm text-muted-foreground font-normal">
                          {project.prospects_count} prospects • {project.videos_generated} videos generated
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-foreground font-normal">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-sm text-black hover:text-black/80 font-normal flex items-center gap-1"
                      >
                        View
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 16L16 12M16 12L12 8M16 12H8M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
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
                    Welcome to Meraki Reach
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
      </DashboardClient>
    </DashboardLayout>
  )
}