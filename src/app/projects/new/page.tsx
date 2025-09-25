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
import { ArrowLeft, Sparkles, Video, Users, Target, CheckCircle, Upload, FileText } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export default function NewProjectPage() {
  // Client-side mounting check
  const [isMounted, setIsMounted] = useState(false)

  // Multi-step wizard state
  const [currentStep, setCurrentStep] = useState(1)
  const [projectId, setProjectId] = useState<string | null>(null)

  // Step 1: Project Details
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [nameError, setNameError] = useState('')

  // Step 2: Video Upload
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoUploading, setVideoUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Step 3: Prospects
  const [prospectMethod, setProspectMethod] = useState<'csv' | 'manual'>('csv')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [manualProspects, setManualProspects] = useState([{ firstName: '', lastName: '', email: '', website: '' }])
  const [prospectsUploading, setProspectsUploading] = useState(false)

  // General state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Don't render if user is not authenticated (will redirect)
  if (!user && !authLoading) {
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

  const steps = [
    {
      number: 1,
      title: 'Project Details',
      icon: () => (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 11H8M10 15H8M16 7H8M20 6.8V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V6.8C4 5.11984 4 4.27976 4.32698 3.63803C4.6146 3.07354 5.07354 2.6146 5.63803 2.32698C6.27976 2 7.11984 2 8.8 2H15.2C16.8802 2 17.7202 2 18.362 2.32698C18.9265 2.6146 19.3854 3.07354 19.673 3.63803C20 4.27976 20 5.11984 20 6.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      number: 2,
      title: 'Upload Video',
      icon: () => (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 8.93137C22 8.32555 22 8.02265 21.8802 7.88238C21.7763 7.76068 21.6203 7.69609 21.4608 7.70865C21.2769 7.72312 21.0627 7.93731 20.6343 8.36569L17 12L20.6343 15.6343C21.0627 16.0627 21.2769 16.2769 21.4608 16.2914C21.6203 16.3039 21.7763 16.2393 21.8802 16.1176C22 15.9774 22 15.6744 22 15.0686V8.93137Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 9.8C2 8.11984 2 7.27976 2.32698 6.63803C2.6146 6.07354 3.07354 5.6146 3.63803 5.32698C4.27976 5 5.11984 5 6.8 5H12.2C13.8802 5 14.7202 5 15.362 5.32698C15.9265 5.6146 16.3854 6.07354 16.673 6.63803C17 7.27976 17 8.11984 17 9.8V14.2C17 15.8802 17 16.7202 16.673 17.362C16.3854 17.9265 15.9265 18.3854 15.362 18.673C14.7202 19 13.8802 19 12.2 19H6.8C5.11984 19 4.27976 19 3.63803 18.673C3.07354 18.3854 2.6146 17.9265 2.32698 17.362C2 16.7202 2 15.8802 2 14.2V9.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      number: 3,
      title: 'Add Prospects',
      icon: () => (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 21V19C22 17.1362 20.7252 15.5701 19 15.126M15.5 3.29076C16.9659 3.88415 18 5.32131 18 7C18 8.67869 16.9659 10.1159 15.5 10.7092M17 21C17 19.1362 17 18.2044 16.6955 17.4693C16.2895 16.4892 15.5108 15.7105 14.5307 15.3045C13.7956 15 12.8638 15 11 15H8C6.13623 15 5.20435 15 4.46927 15.3045C3.48915 15.7105 2.71046 16.4892 2.30448 17.4693C2 18.2044 2 19.1362 2 21M13.5 7C13.5 9.20914 11.7091 11 9.5 11C7.29086 11 5.5 9.20914 5.5 7C5.5 4.79086 7.29086 3 9.5 3C11.7091 3 13.5 4.79086 13.5 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ]

  const progress = (currentStep / steps.length) * 100

  // Step 1: Just validate and move to next step (no project creation yet)
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const trimmedName = name.trim()
    if (!validateName(trimmedName)) {
      setLoading(false)
      return
    }

    // Just move to next step, don't create project yet
    setCurrentStep(2)
    setLoading(false)
  }

  // Step 2: Create Project and Upload Video
  const handleVideoUpload = async (file: File) => {
    if (!file) return

    setVideoUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      let currentProjectId = projectId

      // First create the project if it doesn't exist
      if (!currentProjectId) {
        const trimmedName = name.trim()
        if (!validateName(trimmedName)) {
          setVideoUploading(false)
          return
        }

        const projectResponse = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: trimmedName,
            description: description.trim() || null,
          }),
        })

        const projectResult = await projectResponse.json()

        if (!projectResponse.ok) {
          throw new Error(projectResult.error || 'Failed to create project')
        }

        currentProjectId = projectResult.project.id
        setProjectId(currentProjectId)
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', currentProjectId!)

      // Simulate upload progress (since fetch doesn't support real progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 200)

      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload video')
      }

      setVideoUrl(result.videoUrl)

      // Small delay to show 100% completion
      setTimeout(() => {
        setVideoUploading(false)
      }, 500)

    } catch (error: any) {
      setError(error.message || 'Failed to upload video or create project')
      setVideoUploading(false)
      setUploadProgress(0)
    }
  }

  // Handle file selection and auto-upload
  const handleVideoFileSelect = (file: File) => {
    setVideoFile(file)
    handleVideoUpload(file)
  }

  // Step 3: Upload Prospects and Start Processing
  const handleProspectsUpload = async () => {
    if (!projectId) return

    setProspectsUploading(true)
    setError('')

    try {
      let prospectIds: string[] = []

      // Upload prospects first
      if (prospectMethod === 'csv' && csvFile) {
        const formData = new FormData()
        formData.append('csv', csvFile)
        formData.append('projectId', projectId)

        const response = await fetch('/api/upload-prospects', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to upload prospects')
        }

        prospectIds = result.prospects?.map((p: any) => p.id) || []
      } else if (prospectMethod === 'manual') {
        const validProspects = manualProspects.filter(p => p.firstName.trim())

        const response = await fetch('/api/upload-prospects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId,
            prospects: validProspects,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to upload prospects')
        }

        prospectIds = result.prospects?.map((p: any) => p.id) || []
      }

      // Now start video processing automatically
      if (prospectIds.length > 0) {
        console.log('🚀 Starting automatic video processing for', prospectIds.length, 'prospects')

        // Trigger video processing (fire and forget - processing happens in background)
        fetch('/api/personalize-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId,
            prospectIds,
            position: 'bottom-right', // Default position
            size: 200, // Default size
            isPreview: false
          }),
        }).catch(error => {
          console.error('Background video processing error:', error)
          // Don't block navigation - processing will continue in background
        })
      }

      // Navigate to prospects page where they can see progress
      router.push(`/projects/${projectId}/prospects`)
    } catch (error: any) {
      setError(error.message || 'Failed to upload prospects')
    } finally {
      setProspectsUploading(false)
    }
  }

  const addManualProspect = () => {
    setManualProspects([...manualProspects, { firstName: '', lastName: '', email: '', website: '' }])
  }

  const updateManualProspect = (index: number, field: string, value: string) => {
    const updated = [...manualProspects]
    updated[index] = { ...updated[index], [field]: value }
    setManualProspects(updated)
  }

  const removeManualProspect = (index: number) => {
    setManualProspects(manualProspects.filter((_, i) => i !== index))
  }

  return (
    <DashboardLayout>
      {!isMounted || authLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Link href="/dashboard" className="text-primary hover:text-primary/80 text-sm">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-foreground mt-2">
              Create New Campaign
            </h1>
            <p className="text-muted-foreground mt-1">
              Set up your AI-powered video personalization campaign
            </p>
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Main Content */}
            <div className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Step Content */}
              <Card>
            {/* Step 1: Project Details */}
            {currentStep === 1 && (
              <>
                <CardHeader className="pb-2 pt-1 px-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <div className="h-5 w-5">
                      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 11H8M10 15H8M16 7H8M20 6.8V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V6.8C4 5.11984 4 4.27976 4.32698 3.63803C4.6146 3.07354 5.07354 2.6146 5.63803 2.32698C6.27976 2 7.11984 2 8.8 2H15.2C16.8802 2 17.7202 2 18.362 2.32698C18.9265 2.6146 19.3854 3.07354 19.673 3.63803C20 4.27976 20 5.11984 20 6.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>Project Details</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Give your video campaign a name and description
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col px-3 pb-3">
                  <form onSubmit={handleCreateProject} className="flex flex-col space-y-3">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Project Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value)
                            validateName(e.target.value)
                            setError('')
                          }}
                          placeholder="e.g., Holiday Sales Campaign 2024"
                          className={nameError ? "border-destructive" : ""}
                          required
                        />
                        {nameError ? (
                          <p className="text-xs text-destructive">{nameError}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Choose a memorable name for your video campaign
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe the purpose of this campaign..."
                          rows={4}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional: Add details about your target audience and campaign goals
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={!name.trim() || loading}
                        className="min-w-[140px]"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Continue...
                          </>
                        ) : (
                          'Continue to Video'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </>
            )}

            {/* Step 2: Video Upload */}
            {currentStep === 2 && (
              <>
                <CardHeader className="pb-2 pt-1 px-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <div className="h-5 w-5">
                      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 8.93137C22 8.32555 22 8.02265 21.8802 7.88238C21.7763 7.76068 21.6203 7.69609 21.4608 7.70865C21.2769 7.72312 21.0627 7.93731 20.6343 8.36569L17 12L20.6343 15.6343C21.0627 16.0627 21.2769 16.2769 21.4608 16.2914C21.6203 16.3039 21.7763 16.2393 21.8802 16.1176C22 15.9774 22 15.6744 22 15.0686V8.93137Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 9.8C2 8.11984 2 7.27976 2.32698 6.63803C2.6146 6.07354 3.07354 5.6146 3.63803 5.32698C4.27976 5 5.11984 5 6.8 5H12.2C13.8802 5 14.7202 5 15.362 5.32698C15.9265 5.6146 16.3854 6.07354 16.673 6.63803C17 7.27976 17 8.11984 17 9.8V14.2C17 15.8802 17 16.7202 16.673 17.362C16.3854 17.9265 15.9265 18.3854 15.362 18.673C14.7202 19 13.8802 19 12.2 19H6.8C5.11984 19 4.27976 19 3.63803 18.673C3.07354 18.3854 2.6146 17.9265 2.32698 17.362C2 16.7202 2 15.8802 2 14.2V9.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>Upload Base Video</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Upload your talking head video with [FIRST_NAME] placeholder text. Your project will be created when you upload the video.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col px-3 pb-3">
                  <div className="flex-1 flex flex-col space-y-6">
                    {/* Video Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 flex-1 flex flex-col justify-center ${
                        videoUploading ? 'border-primary bg-primary/5' :
                        videoFile && videoUrl ? 'border-green-300 bg-green-50' :
                        'border-muted-foreground/25 hover:border-muted-foreground/50'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.add('border-primary', 'bg-primary/5')
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-primary', 'bg-primary/5')
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-primary', 'bg-primary/5')
                        const files = e.dataTransfer.files
                        if (files[0] && files[0].type.startsWith('video/')) {
                          handleVideoFileSelect(files[0])
                        }
                      }}
                    >
                      {videoUploading ? (
                        <div className="space-y-3">
                          <Upload className="h-10 w-10 text-primary mx-auto animate-pulse" />
                          <div>
                            <p className="font-medium text-primary">Uploading Video...</p>
                            <p className="text-sm text-muted-foreground">{videoFile?.name}</p>
                          </div>
                          <div className="w-full max-w-xs mx-auto">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-xs text-center text-muted-foreground mt-1">
                              {Math.round(uploadProgress)}% complete
                            </p>
                          </div>
                        </div>
                      ) : videoFile && videoUrl ? (
                        <div className="space-y-3">
                          <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
                          <div>
                            <p className="font-medium text-green-700">Video Uploaded!</p>
                            <p className="text-sm text-muted-foreground">{videoFile.name}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setVideoFile(null)
                              setVideoUrl(null)
                              setUploadProgress(0)
                            }}
                          >
                            Choose Different Video
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                          <div>
                            <p className="font-medium">Drop your video here</p>
                            <p className="text-sm text-muted-foreground">or click to browse</p>
                          </div>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleVideoFileSelect(file)
                            }}
                            className="hidden"
                            id="video-upload"
                          />
                          <Button asChild variant="outline" size="sm">
                            <label htmlFor="video-upload" className="cursor-pointer">
                              Choose Video File
                            </label>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Help Text */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Pro tip:</strong> Include "[FIRST_NAME]" in your video where you want prospect names to appear. Your project will be created when you upload the video.
                      </p>
                    </div>

                    <div className="flex justify-between mt-auto pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        disabled={videoUploading}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => setCurrentStep(3)}
                        disabled={videoUploading || !videoUrl}
                        className="min-w-[140px]"
                      >
                        {videoUploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Creating Project...
                          </>
                        ) : !videoUrl ? (
                          'Upload Video to Create Project'
                        ) : (
                          'Continue to Prospects'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 3: Add Prospects */}
            {currentStep === 3 && (
              <>
                <CardHeader className="pb-2 pt-1 px-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <div className="h-5 w-5">
                      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 21V19C22 17.1362 20.7252 15.5701 19 15.126M15.5 3.29076C16.9659 3.88415 18 5.32131 18 7C18 8.67869 16.9659 10.1159 15.5 10.7092M17 21C17 19.1362 17 18.2044 16.6955 17.4693C16.2895 16.4892 15.5108 15.7105 14.5307 15.3045C13.7956 15 12.8638 15 11 15H8C6.13623 15 5.20435 15 4.46927 15.3045C3.48915 15.7105 2.71046 16.4892 2.30448 17.4693C2 18.2044 2 19.1362 2 21M13.5 7C13.5 9.20914 11.7091 11 9.5 11C7.29086 11 5.5 9.20914 5.5 7C5.5 4.79086 7.29086 3 9.5 3C11.7091 3 13.5 4.79086 13.5 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>Add Prospects</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Import your prospects via CSV file or add them manually
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col px-3 pb-3">
                  <div className="flex-1 flex flex-col space-y-4">
                    {/* Method Selection */}
                    <div className="flex space-x-3">
                      <Button
                        variant={prospectMethod === 'csv' ? 'default' : 'outline'}
                        onClick={() => setProspectMethod('csv')}
                        className="flex-1"
                      >
                        Upload CSV
                      </Button>
                      <Button
                        variant={prospectMethod === 'manual' ? 'default' : 'outline'}
                        onClick={() => setProspectMethod('manual')}
                        className="flex-1"
                      >
                        Add Manually
                      </Button>
                    </div>

                    {/* CSV Upload */}
                    {prospectMethod === 'csv' && (
                      <div className="space-y-4">
                        <div
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            csvFile ? 'border-green-300 bg-green-50' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                          }`}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.currentTarget.classList.add('border-primary', 'bg-primary/5')
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault()
                            e.currentTarget.classList.remove('border-primary', 'bg-primary/5')
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            e.currentTarget.classList.remove('border-primary', 'bg-primary/5')
                            const files = e.dataTransfer.files
                            if (files[0] && files[0].name.endsWith('.csv')) {
                              setCsvFile(files[0])
                            }
                          }}
                        >
                          {csvFile ? (
                            <div className="space-y-2">
                              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                              <p className="font-medium text-green-700">CSV Ready!</p>
                              <p className="text-sm text-muted-foreground">{csvFile.name}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCsvFile(null)}
                              >
                                Choose Different File
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                              <div>
                                <p className="font-medium">Drop CSV file here</p>
                                <p className="text-sm text-muted-foreground">or click to browse</p>
                              </div>
                              <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) setCsvFile(file)
                                }}
                                className="hidden"
                                id="csv-upload"
                              />
                              <Button asChild variant="outline" size="sm">
                                <label htmlFor="csv-upload" className="cursor-pointer">
                                  Choose CSV File
                                </label>
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-sm text-amber-800">
                            📋 <strong>CSV Format:</strong> Include columns for first_name, last_name, email, and website_url
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Manual Entry */}
                    {prospectMethod === 'manual' && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          {manualProspects.map((prospect, index) => (
                            <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border rounded-lg">
                              <Input
                                placeholder="First Name"
                                value={prospect.firstName}
                                onChange={(e) => updateManualProspect(index, 'firstName', e.target.value)}
                              />
                              <Input
                                placeholder="Last Name"
                                value={prospect.lastName}
                                onChange={(e) => updateManualProspect(index, 'lastName', e.target.value)}
                              />
                              <Input
                                placeholder="Email"
                                type="email"
                                value={prospect.email}
                                onChange={(e) => updateManualProspect(index, 'email', e.target.value)}
                              />
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Website URL"
                                  value={prospect.website}
                                  onChange={(e) => updateManualProspect(index, 'website', e.target.value)}
                                  className="flex-1"
                                />
                                {manualProspects.length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeManualProspect(index)}
                                  >
                                    ×
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          onClick={addManualProspect}
                          className="w-full"
                        >
                          + Add Another Prospect
                        </Button>
                      </div>
                    )}

                    <div className="flex justify-between mt-auto pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleProspectsUpload}
                        disabled={
                          prospectsUploading ||
                          (prospectMethod === 'csv' && !csvFile) ||
                          (prospectMethod === 'manual' && !manualProspects.some(p => p.firstName.trim()))
                        }
                        className="min-w-[140px]"
                      >
                        {prospectsUploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          'Complete Setup & Start Processing'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
              </Card>
            </div>

            {/* Right Column - Tips & Steps */}
            <div className="space-y-6">
              {/* Progress */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
                <div className="space-y-4">
                  <div className="w-full">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Step {currentStep} of {steps.length}</span>
                      <span>{Math.round(progress)}% Complete</span>
                    </div>
                  </div>

                  {/* Step Indicators */}
                  <div className="space-y-3">
                    {steps.map((step) => {
                      const StepIcon = step.icon
                      const isActive = currentStep === step.number
                      const isCompleted = currentStep > step.number

                      return (
                        <div key={step.number} className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                            isCompleted
                              ? 'bg-green-100 border-green-500 text-green-600'
                              : isActive
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <div className="h-4 w-4">
                                <StepIcon />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                            }`}>
                              {step.title}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}