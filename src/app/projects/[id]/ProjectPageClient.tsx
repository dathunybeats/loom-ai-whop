'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
// Lazy load modal components
const VideoUploadModal = lazy(() => import('@/components/VideoUploadModal'))
const CSVUploadModal = lazy(() => import('@/components/CSVUploadModal'))
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load the heavy VideoPlayer component
const VideoPlayer = lazy(() => import('@/components/VideoPlayer'))

interface Project {
  id: string
  name: string
  description: string | null
  base_video_url: string | null
  voice_sample_url: string | null
  prospects_count: number
  videos_generated: number
  created_at: string
}

interface User {
  id: string
  email?: string
}

interface ProjectPageClientProps {
  project: Project
  user: User
}

export default function ProjectPageClient({ project, user }: ProjectPageClientProps) {
  const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false)
  const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState(project.base_video_url)
  const [projectStats, setProjectStats] = useState({
    prospects_count: project.prospects_count || 0,
    videos_generated: project.videos_generated || 0
  })

  // Sync client state with server-side props when they change (e.g., after refresh)
  useEffect(() => {
    setProjectStats({
      prospects_count: project.prospects_count || 0,
      videos_generated: project.videos_generated || 0
    })
  }, [project.prospects_count, project.videos_generated])

  const handleVideoUploadSuccess = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl)
  }

  const handleCSVUploadSuccess = async (uploadId: string, prospectCount: number) => {
    // Update local project stats
    setProjectStats(prev => ({
      ...prev,
      prospects_count: prev.prospects_count + prospectCount
    }))
    
    // Show success message
    alert(`Successfully imported ${prospectCount} prospects!`)
  }

  // Refresh project stats from database - get real-time counts
  const refreshProjectStats = async () => {
    try {
      const supabase = createClient()
      
      // Get real-time prospect count
      const { count: prospectCount } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)
        .eq('user_id', user.id)

      const { count: videoCount } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)
        .eq('user_id', user.id)
        .eq('video_status', 'completed')

      setProjectStats({
        prospects_count: prospectCount || 0,
        videos_generated: videoCount || 0
      })
    } catch (error) {
      console.error('Failed to refresh project stats:', error)
    }
  }

  // Remove the automatic refresh on mount since server-side data is already current
  // Only refresh when needed (after CSV uploads, etc.)

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-4 sm:py-6">
        <div className="px-3 sm:px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Link href="/dashboard" className="text-primary hover:text-primary/80 text-sm font-medium">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground mt-1">{project.description}</p>
              )}
            </div>
            <LogoutButton />
          </div>

          {/* Video Preview Section */}
          {currentVideoUrl && (
            <div className="mb-6 bg-card border border-border shadow-sm rounded-lg">
              <div className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h3 className="text-lg font-medium text-card-foreground">Base Video Preview</h3>
                  <button
                    onClick={() => setIsVideoUploadOpen(true)}
                    className="text-primary hover:text-primary/80 text-sm font-medium self-start sm:self-auto"
                  >
                    Replace Video
                  </button>
                </div>
                
                {/* Responsive Video Container */}
                <div className="w-full">
                  <div className="relative w-full max-w-4xl mx-auto">
                    {/* Video Player with responsive aspect ratio */}
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                      <div className="absolute inset-0">
                        <Suspense fallback={
                          <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center">
                            <Skeleton className="w-full h-full rounded-lg" />
                          </div>
                        }>
                          <VideoPlayer 
                            videoUrl={currentVideoUrl} 
                            className="w-full h-full rounded-lg overflow-hidden"
                            projectId={project.id}
                            projectName={project.name}
                            showShare={true}
                          />
                        </Suspense>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 bg-muted/50 border border-border rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">
                    💡 Make sure your video includes "[FIRST_NAME]" where you want prospect names to appear
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Video Upload Card */}
            <div className="bg-card border border-border overflow-hidden shadow-sm rounded-lg">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground mb-4">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-card-foreground mb-2">
                  Base Video
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your talking head video with [FIRST_NAME] placeholder
                </p>
                {currentVideoUrl ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Video uploaded
                    </p>
                    <button 
                      onClick={() => setIsVideoUploadOpen(true)}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      Replace video
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsVideoUploadOpen(true)}
                    className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    Upload Video
                  </button>
                )}
              </div>
            </div>

            {/* Prospects Card */}
            <div className="bg-card border border-border overflow-hidden shadow-sm rounded-lg">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-600 text-white mb-4">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-card-foreground mb-2">
                  Prospects
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload CSV with prospect names and contact info
                </p>
                {projectStats.prospects_count > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {projectStats.prospects_count} prospects uploaded
                      </span>
                      <Link 
                        href={`/projects/${project.id}/prospects`}
                        className="text-green-600 dark:text-green-400 hover:text-green-500 text-sm font-medium"
                      >
                        View All →
                      </Link>
                    </div>
                    <button 
                      onClick={() => setIsCSVUploadOpen(true)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Add More Prospects
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsCSVUploadOpen(true)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Upload CSV
                  </button>
                )}
              </div>
            </div>

            {/* Voice Sample Card */}
            <div className="bg-card border border-border overflow-hidden shadow-sm rounded-lg">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-600 text-white mb-4">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-card-foreground mb-2">
                  Voice Sample
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Record your voice for AI cloning
                </p>
                {project.voice_sample_url ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Voice recorded
                    </p>
                    <button className="text-purple-600 hover:text-purple-500 text-sm font-medium">
                      Re-record
                    </button>
                  </div>
                ) : (
                  <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium">
                    Record Voice
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Project Stats */}
          <div className="mt-6 bg-card border border-border shadow-sm rounded-lg">
            <div className="px-3 sm:px-4 py-4 sm:py-5">
              <h3 className="text-lg leading-6 font-medium text-card-foreground mb-4">
                Project Status
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {new Date(project.created_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Prospects</dt>
                  <dd className="mt-1 text-sm text-foreground">{projectStats.prospects_count}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Videos Generated</dt>
                  <dd className="mt-1 text-sm text-foreground">{projectStats.videos_generated}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Video Upload Modal */}
      <Suspense fallback={null}>
        <VideoUploadModal
          isOpen={isVideoUploadOpen}
          onClose={() => setIsVideoUploadOpen(false)}
          projectId={project.id}
          currentVideoUrl={currentVideoUrl || undefined}
          onUploadSuccess={handleVideoUploadSuccess}
        />
      </Suspense>

      {/* CSV Upload Modal */}
      <Suspense fallback={null}>
        <CSVUploadModal
          isOpen={isCSVUploadOpen}
          onClose={() => setIsCSVUploadOpen(false)}
          projectId={project.id}
          onUploadSuccess={handleCSVUploadSuccess}
        />
      </Suspense>
    </div>
  )
}