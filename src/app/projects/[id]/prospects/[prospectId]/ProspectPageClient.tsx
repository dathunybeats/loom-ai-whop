'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import VideoPlayer from '@/components/VideoPlayer'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

type Prospect = Database['public']['Tables']['prospects']['Row']
type Project = Database['public']['Tables']['projects']['Row']
type User = {
  id: string
  email?: string
}

interface ProspectPageClientProps {
  project: Project
  prospect: Prospect
  user: User
}

export default function ProspectPageClient({ 
  project, 
  prospect: initialProspect, 
  user 
}: ProspectPageClientProps) {
  const [prospect, setProspect] = useState<Prospect>(initialProspect)
  const [isGenerating, setIsGenerating] = useState(false)

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-800 bg-yellow-100',
      processing: 'text-blue-800 bg-blue-100',
      completed: 'text-green-800 bg-green-100',
      failed: 'text-red-800 bg-red-100'
    }
    return colors[status as keyof typeof colors] || 'text-gray-800 bg-gray-100'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleGenerateVideo = async () => {
    setIsGenerating(true)
    try {
      // Simulate video generation process
      // In a real implementation, this would trigger a background job
      
      // Update prospect status to processing
      const supabase = createClient()
      const { error } = await supabase
        .from('prospects')
        .update({ 
          video_status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', prospect.id)

      if (!error) {
        setProspect(prev => ({
          ...prev,
          video_status: 'processing',
          updated_at: new Date().toISOString()
        }))
        
        // Simulate processing time and then complete
        setTimeout(async () => {
          const { error: completeError } = await supabase
            .from('prospects')
            .update({ 
              video_status: 'completed',
              video_url: project.base_video_url, // For demo, use base video
              video_generated_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', prospect.id)

          if (!completeError) {
            setProspect(prev => ({
              ...prev,
              video_status: 'completed',
              video_url: project.base_video_url,
              video_generated_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
          }
          setIsGenerating(false)
        }, 5000) // 5 second demo delay
      }
    } catch (error) {
      console.error('Error generating video:', error)
      alert('Failed to generate video')
      setIsGenerating(false)
    }
  }

  const handleDeleteProspect = async () => {
    if (!confirm('Are you sure you want to delete this prospect?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', prospect.id)

      if (!error) {
        // Redirect back to prospects list
        window.location.href = `/projects/${project.id}/prospects`
      } else {
        alert('Failed to delete prospect')
      }
    } catch (error) {
      console.error('Error deleting prospect:', error)
      alert('Failed to delete prospect')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Link 
                href={`/projects/${project.id}/prospects`} 
                className="text-indigo-600 hover:text-indigo-500 text-sm"
              >
                ← Back to Prospects
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">
                {prospect.first_name} {prospect.last_name}
              </h1>
              <p className="text-gray-600 mt-1">
                Prospect in {project.name}
              </p>
            </div>
            <LogoutButton />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Prospect Details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {prospect.first_name} {prospect.last_name}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a 
                          href={`mailto:${prospect.email}`}
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {prospect.email}
                        </a>
                      </dd>
                    </div>
                    
                    {prospect.company && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Company</dt>
                        <dd className="mt-1 text-sm text-gray-900">{prospect.company}</dd>
                      </div>
                    )}
                    
                    {prospect.title && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Title</dt>
                        <dd className="mt-1 text-sm text-gray-900">{prospect.title}</dd>
                      </div>
                    )}
                    
                    {prospect.phone && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <a 
                            href={`tel:${prospect.phone}`}
                            className="text-indigo-600 hover:text-indigo-500"
                          >
                            {prospect.phone}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Video Status
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prospect.video_status)}`}>
                          {prospect.video_status}
                        </span>
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Added</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(prospect.created_at)}
                      </dd>
                    </div>
                    
                    {prospect.video_generated_at && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Video Generated</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDate(prospect.video_generated_at)}
                        </dd>
                      </div>
                    )}
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Views</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {prospect.video_view_count} views
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Card */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Actions
                  </h3>
                  
                  <div className="space-y-3">
                    {prospect.video_status === 'pending' && project.base_video_url && (
                      <button
                        onClick={handleGenerateVideo}
                        disabled={isGenerating}
                        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? 'Generating Video...' : 'Generate Personalized Video'}
                      </button>
                    )}
                    
                    {prospect.video_status === 'pending' && !project.base_video_url && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          Upload a base video to the project before generating personalized videos.
                        </p>
                        <Link 
                          href={`/projects/${project.id}`}
                          className="text-yellow-900 hover:text-yellow-700 text-sm font-medium"
                        >
                          Go to project →
                        </Link>
                      </div>
                    )}
                    
                    {prospect.video_url && (
                      <a
                        href={prospect.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors block text-center"
                      >
                        Download Video
                      </a>
                    )}
                    
                    <button
                      onClick={handleDeleteProspect}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete Prospect
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Video Preview
                  </h3>
                  
                  {prospect.video_url ? (
                    <div className="space-y-4">
                      <VideoPlayer 
                        videoUrl={prospect.video_url}
                        className="w-full"
                      />
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-green-800 mb-2">
                          ✅ Personalized Video Ready!
                        </h4>
                        <p className="text-sm text-green-700">
                          This video has been personalized for <strong>{prospect.first_name}</strong>. 
                          You can now share it or send it via email.
                        </p>
                      </div>
                    </div>
                  ) : prospect.video_status === 'processing' ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-blue-50 rounded-lg">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <h4 className="text-lg font-medium text-blue-900 mb-2">
                        Generating Personalized Video
                      </h4>
                      <p className="text-sm text-blue-700 text-center max-w-md">
                        We're creating a personalized video for {prospect.first_name}. 
                        This usually takes a few minutes...
                      </p>
                    </div>
                  ) : project.base_video_url ? (
                    <div className="space-y-4">
                      <VideoPlayer 
                        videoUrl={project.base_video_url}
                        className="w-full"
                      />
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">
                          📹 Base Video Preview
                        </h4>
                        <p className="text-sm text-blue-700 mb-3">
                          This is your base video. When you generate a personalized version, 
                          "[FIRST_NAME]" will be replaced with "<strong>{prospect.first_name}</strong>".
                        </p>
                        <button
                          onClick={handleGenerateVideo}
                          disabled={isGenerating}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {isGenerating ? 'Generating...' : 'Generate Personalized Video'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
                      <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No Base Video Available
                      </h4>
                      <p className="text-sm text-gray-600 text-center max-w-md mb-4">
                        Upload a base video to your project before you can generate personalized videos for prospects.
                      </p>
                      <Link
                        href={`/projects/${project.id}`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                      >
                        Go to Project
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}