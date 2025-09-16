'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Upload,
  Video,
  Play,
  Share2,
  Eye,
  Sparkles,
  Crown,
  CheckCircle,
  X
} from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'

interface TrialModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
}

interface ProspectInput {
  name: string
  website: string
}

export function TrialModal({ isOpen, onClose, onUpgrade }: TrialModalProps) {
  const { user } = useSubscription()
  const [step, setStep] = useState<'upload' | 'processing' | 'preview' | 'upgrade'>('upload')
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [generatedVideos, setGeneratedVideos] = useState<Array<{
    id: string
    name: string
    videoUrl: string
    shareUrl: string
    gifUrl: string
  }>>([])

  const [prospects, setProspects] = useState<ProspectInput[]>([
    { name: '', website: '' },
    { name: '', website: '' },
    { name: '', website: '' },
    { name: '', website: '' },
    { name: '', website: '' }
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setUploadedVideo(file)
      setVideoPreview(URL.createObjectURL(file))
    }
  }

  const updateProspect = (index: number, field: 'name' | 'website', value: string) => {
    const updated = [...prospects]
    updated[index][field] = value
    setProspects(updated)
  }

  const canStartTrial = () => {
    return uploadedVideo && prospects.some(p => p.name.trim() !== '')
  }

  const startTrialGeneration = async () => {
    if (!canStartTrial()) return

    setStep('processing')
    setProgress(0)

    // Simulate processing with progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 1000)

    try {
      // TODO: Implement actual video generation API call
      await new Promise(resolve => setTimeout(resolve, 8000))

      // Mock generated videos
      const mockVideos = prospects
        .filter(p => p.name.trim())
        .map((prospect, index) => ({
          id: `trial-${index}`,
          name: prospect.name,
          videoUrl: `/api/mock-video/${index}`, // Mock URLs
          shareUrl: `https://yourdomain.com/view/${prospect.name.toLowerCase().replace(' ', '-')}`,
          gifUrl: `/api/mock-gif/${index}`
        }))

      setGeneratedVideos(mockVideos)
      setProgress(100)

      setTimeout(() => {
        setStep('preview')
      }, 1000)

    } catch (error) {
      console.error('Trial generation failed:', error)
      // Handle error
    }

    clearInterval(progressInterval)
  }

  const handleUpgrade = () => {
    setStep('upgrade')
    onUpgrade()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent hideCloseButton className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogDescription className="sr-only">Trial onboarding and upgrade flow for non-paid users</DialogDescription>
        {/* Upload Step */}
        {step === 'upload' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Try 5 Videos Free
              </DialogTitle>
              <p className="text-muted-foreground text-center">
                Upload your video and add up to 5 prospects to see the magic in action
              </p>
            </DialogHeader>

            <div className="space-y-5">
              {/* Video Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Upload Your Base Video
                  </CardTitle>
                  <CardDescription>
                    Upload a video where you say &quot;[FIRST_NAME]&quot; - we&apos;ll personalize it for each prospect
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium">
                        {uploadedVideo ? uploadedVideo.name : 'Click to upload video'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        MP4, MOV, or AVI up to 100MB
                      </p>
                    </div>

                    {videoPreview && (
                      <video
                        src={videoPreview}
                        controls
                        className="w-full max-w-md mx-auto rounded-lg"
                      />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </CardContent>
              </Card>

              {/* Prospects Input */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Prospects (Up to 5)</CardTitle>
                  <CardDescription>
                    Enter names and websites for personalized videos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {prospects.map((prospect, index) => (
                    <div key={index} className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`name-${index}`}>Name</Label>
                        <Input
                          id={`name-${index}`}
                          placeholder="e.g., John Smith"
                          value={prospect.name}
                          onChange={(e) => updateProspect(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`website-${index}`}>Website</Label>
                        <Input
                          id={`website-${index}`}
                          placeholder="e.g., company.com"
                          value={prospect.website}
                          onChange={(e) => updateProspect(index, 'website', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button
                  onClick={startTrialGeneration}
                  disabled={!canStartTrial()}
                  size="lg"
                  className="px-8"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Trial Videos
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                Creating Your Personalized Videos
              </DialogTitle>
              <p className="text-muted-foreground text-center">
                Our AI is working its magic... This usually takes 30-60 seconds
              </p>
            </DialogHeader>

            <div className="space-y-5 py-6">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Video className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <Progress value={progress} className="w-full max-w-md mx-auto" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {progress < 30 && "Analyzing your video..."}
                  {progress >= 30 && progress < 60 && "Generating personalized content..."}
                  {progress >= 60 && progress < 90 && "Creating video files..."}
                  {progress >= 90 && "Almost done!"}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Your Trial Videos Are Ready!
              </DialogTitle>
              <p className="text-muted-foreground text-center">
                Here&apos;s how your personalized videos look. Try the features below:
              </p>
            </DialogHeader>

            <div className="space-y-3">
              {generatedVideos.map((video, index) => (
                <Card key={video.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">Video for {video.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <video
                          src={video.videoUrl}
                          controls
                          className="w-full rounded-lg"
                          controlsList="nodownload"
                        />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Share Link Preview</Label>
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <p className="text-sm font-mono break-all">{video.shareUrl}</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              <Share2 className="mr-2 h-4 w-4" />
                              Preview Share Page
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">GIF Preview</Label>
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <img
                              src={video.gifUrl}
                              alt="Video GIF"
                              className="w-full max-w-[200px] rounded"
                            />
                            <Button variant="outline" size="sm" className="mt-2">
                              <Eye className="mr-2 h-4 w-4" />
                              View GIF
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-primary bg-primary/5">
                <CardContent className="pt-5">
                  <div className="text-center space-y-3">
                    <Crown className="h-10 w-10 mx-auto text-primary" />
                    <h3 className="text-xl font-bold">Ready to unlock unlimited videos?</h3>
                    <p className="text-muted-foreground">
                      Your trial is complete! Upgrade to create unlimited personalized videos,
                      download your content, and access advanced features.
                    </p>
                    <Button size="lg" onClick={handleUpgrade} className="px-8">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}














