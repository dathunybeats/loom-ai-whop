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

  const steps = [
    { number: 1, title: 'Project Details', icon: FileText },
    { number: 2, title: 'Upload Video', icon: Video },
    { number: 3, title: 'Add Prospects', icon: Users }
  ]

  const progress = (currentStep / steps.length) * 100

  // Step 1: Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const trimmedName = name.trim()
    if (!validateName(trimmedName)) {
      setLoading(false)
      return
    }

    try {
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

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project')
      }

      setProjectId(result.project.id)
      setCurrentStep(2)
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Upload Video
  const handleVideoUpload = async () => {
    if (!videoFile || !projectId) return

    setVideoUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('projectId', projectId)

      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload video')
      }

      setVideoUrl(result.videoUrl)
      setCurrentStep(3)
    } catch (error: any) {
      setError(error.message || 'Failed to upload video')
    } finally {
      setVideoUploading(false)
    }
  }

  // Step 3: Upload Prospects
  const handleProspectsUpload = async () => {
    if (!projectId) return

    setProspectsUploading(true)
    setError('')

    try {
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
      }

      // Navigate to project page
      router.push(`/projects/${projectId}`)
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

        <div className="max-w-3xl mx-auto">
          {/* Progress Header */}
          <div className="text-center mb-8">
            <div className="flex items-center space-x-3 justify-center mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Create New Campaign</h1>
            </div>
            <p className="text-muted-foreground text-lg mb-6">
              Set up your AI-powered video personalization campaign in 3 simple steps
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto mb-8">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Step {currentStep} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center space-x-8 mb-8">
              {steps.map((step) => {
                const StepIcon = step.icon
                const isActive = currentStep === step.number
                const isCompleted = currentStep > step.number

                return (
                  <div key={step.number} className="flex flex-col items-center space-y-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      isCompleted
                        ? 'bg-green-100 border-green-500 text-green-600'
                        : isActive
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="text-center">
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

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Step Content */}
          <Card className="w-full">
            {/* Step 1: Project Details */}
            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Project Details</span>
                  </CardTitle>
                  <CardDescription>
                    Give your video campaign a name and description
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateProject} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name *</Label>
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

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={!name.trim() || loading}
                        className="min-w-[140px]"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Creating...
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
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="h-5 w-5" />
                    <span>Upload Base Video</span>
                  </CardTitle>
                  <CardDescription>
                    Upload your talking head video with [FIRST_NAME] placeholder text
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Video Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        videoFile ? 'border-green-300 bg-green-50' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
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
                          setVideoFile(files[0])
                        }
                      }}
                    >
                      {videoFile ? (
                        <div className="space-y-4">
                          <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                          <div>
                            <p className="text-lg font-medium text-green-700">Video Ready!</p>
                            <p className="text-sm text-muted-foreground">{videoFile.name}</p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setVideoFile(null)}
                            className="mt-2"
                          >
                            Choose Different Video
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                          <div>
                            <p className="text-lg font-medium">Drop your video here</p>
                            <p className="text-sm text-muted-foreground">or click to browse</p>
                          </div>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) setVideoFile(file)
                            }}
                            className="hidden"
                            id="video-upload"
                          />
                          <Button asChild variant="outline">
                            <label htmlFor="video-upload" className="cursor-pointer">
                              Choose Video File
                            </label>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Help Text */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Pro tip:</strong> Make sure your video includes "[FIRST_NAME]" where you want prospect names to appear.
                        For example: "Hi [FIRST_NAME], I noticed your website..."
                      </p>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleVideoUpload}
                        disabled={!videoFile || videoUploading}
                        className="min-w-[140px]"
                      >
                        {videoUploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Uploading...
                          </>
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
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Add Prospects</span>
                  </CardTitle>
                  <CardDescription>
                    Import your prospects via CSV file or add them manually
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Method Selection */}
                    <div className="flex space-x-4">
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

                    <div className="flex justify-between pt-4">
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
                          'Complete Setup'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}