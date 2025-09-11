'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { VideoCreationGuard } from '@/components/video-creation-guard'

export default function NewProjectPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to create a project')
      }

      // Create project
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name,
            description,
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Redirect to project detail page
      router.push(`/projects/${data.id}`)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Create New Project</h1>
          <p className="text-gray-600 mt-2">
            Start a new video outreach campaign by giving it a name and description.
          </p>
        </div>
        
        <VideoCreationGuard feature="create new projects">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Holiday Sales Campaign 2024"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Choose a memorable name for your video campaign
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe the purpose of this campaign..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: Add details about this project
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-500 px-4 py-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">What's Next?</h3>
          <p className="text-sm text-blue-700">
            After creating your project, you'll be able to upload your base video and add prospects for personalization.
          </p>
        </div>
        
        </VideoCreationGuard>
      </div>
    </div>
  )
}