import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'
import { Suspense } from 'react'

interface SharePageProps {
  params: Promise<{ id: string }>
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch project data without authentication - public access
  // For now, all projects with videos are shareable until we add the column
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name, description, base_video_url, created_at')
    .eq('id', id)
    .single()

  if (error || !project || !project.base_video_url) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Loom.ai</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Project Info */}
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h2>
            {project.description && (
              <p className="text-gray-600">{project.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Shared on {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Video Player */}
          <div className="p-6">
            <div className="relative w-full max-w-3xl mx-auto">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                <div className="absolute inset-0">
                  <Suspense fallback={
                    <div className="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  }>
                    <VideoPlayer 
                      videoUrl={project.base_video_url} 
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

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Create your own personalized videos with Loom.ai
              </p>
              <a 
                href="/" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export async function generateMetadata({ params }: SharePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('name, description')
    .eq('id', id)
    .single()

  return {
    title: project?.name ? `${project.name} - Loom.ai` : 'Shared Video - Loom.ai',
    description: project?.description || 'Watch this personalized video created with Loom.ai',
    openGraph: {
      title: project?.name || 'Shared Video',
      description: project?.description || 'Watch this personalized video created with Loom.ai',
      type: 'video.other'
    }
  }
}
