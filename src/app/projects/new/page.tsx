'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { VideoCreationGuard } from '@/components/video-creation-guard'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Sparkles, Video, Users, Target } from 'lucide-react'

export default function NewProjectPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [nameError, setNameError] = useState('')
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Show loading spinner while auth is being checked
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null
  }

  // Real-time validation for name
  const validateName = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setNameError('Project name is required')
      return false
    }
    if (trimmed.length < 3) {
      setNameError('Must be at least 3 characters')
      return false
    }
    if (trimmed.length > 100) {
      setNameError('Must be less than 100 characters')
      return false
    }
    setNameError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Client-side validation
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Project name is required')
      setLoading(false)
      return
    }

    if (trimmedName.length < 3) {
      setError('Project name must be at least 3 characters long')
      setLoading(false)
      return
    }

    if (trimmedName.length > 100) {
      setError('Project name must be less than 100 characters')
      setLoading(false)
      return
    }

    try {
      console.log('🚀 Starting project creation...')

      // Use API route instead of direct Supabase call to avoid client-side auth issues
      console.log('📡 Calling project creation API...')
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim() || null,
        }),
      })

      console.log('✅ API call completed, status:', response.status)

      const result = await response.json()
      console.log('📋 API response:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project')
      }

      console.log('✅ Project created successfully:', result.project)

      // Reset form state before redirect
      setName('')
      setDescription('')
      setError('')
      setNameError('')

      // Navigate to the new project
      router.push(`/projects/${result.project.id}`)
      
    } catch (error: any) {
      console.error('💥 Error creating project:', error)
      setError(error.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="max-w-2xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Create New Project</h1>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Start a new AI-powered video personalization campaign
          </p>
        </div>

        {/* <VideoCreationGuard feature="create new projects"> */}
          <div className="max-w-2xl space-y-8">
            {/* Main Form Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="h-5 w-5" />
                  <span>Project Details</span>
                </CardTitle>
                <CardDescription>
                  Give your video campaign a name and description to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        validateName(e.target.value)
                        setError('') // Clear form error when user starts typing
                      }}
                      placeholder="e.g., Holiday Sales Campaign 2024"
                      className={nameError ? "border-destructive" : ""}
                      required
                    />
                    {nameError ? (
                      <p className="text-sm text-destructive">{nameError}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Choose a memorable name for your video campaign
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the purpose of this campaign..."
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      Optional: Add details about your target audience and campaign goals
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="outline" asChild>
                      <Link href="/dashboard">Cancel</Link>
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading || !name.trim()}
                      className="min-w-[120px]"
                    >
                      {loading ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* What's Next Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>What's Next?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    After creating your project, you'll be able to:
                  </p>
                  <div className="grid gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                        1
                      </div>
                      <span className="text-sm">Upload your base video with [FIRST_NAME] placeholders</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                        2
                      </div>
                      <span className="text-sm">Import prospects via CSV or manual entry</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                        3
                      </div>
                      <span className="text-sm">Generate personalized videos with AI voice cloning</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        {/* </VideoCreationGuard> */}
      </div>
    </DashboardLayout>
  )
}