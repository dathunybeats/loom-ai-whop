'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import VideoLayoutDemo from '@/components/VideoLayoutDemo'
import {
  Play,
  Settings2,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Video,
  Image as ImageIcon
} from 'lucide-react'

export interface VideoPersonalizationSettings {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  size: number // Diameter in pixels (100-400)
  useAudioOnly: boolean
}

interface VideoPersonalizationControlsProps {
  projectId: string
  prospectCount: number
  onStartPersonalization: (settings: VideoPersonalizationSettings, isPreview: boolean) => Promise<void>
  onStartPreview: (settings: VideoPersonalizationSettings) => Promise<void>
  isProcessing: boolean
  processingProgress?: {
    total: number
    completed: number
    failed: number
    current?: string
  }
}

const POSITION_OPTIONS: Array<{
  value: VideoPersonalizationSettings['position']
  label: string
  description: string
}> = [
  { value: 'top-left', label: 'Top Left', description: 'Upper left corner' },
  { value: 'top-right', label: 'Top Right', description: 'Upper right corner' },
  { value: 'bottom-left', label: 'Bottom Left', description: 'Lower left corner' },
  { value: 'bottom-right', label: 'Bottom Right', description: 'Lower right corner (Loom style)' },
]


export function VideoPersonalizationControls({
  projectId,
  prospectCount,
  onStartPersonalization,
  onStartPreview,
  isProcessing,
  processingProgress
}: VideoPersonalizationControlsProps) {
  const [settings, setSettings] = useState<VideoPersonalizationSettings>({
    position: 'bottom-right',
    size: 200,
    useAudioOnly: false
  })

  const handleStartPreview = async () => {
    await onStartPreview(settings)
  }

  const handleStartPersonalization = async () => {
    await onStartPersonalization(settings, false)
  }

  return (
    <div className="space-y-6">
      {/* Video Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Personalization Mode
          </CardTitle>
          <CardDescription>
            Choose between video with circular overlay or audio-only with profile picture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <button
              className={`p-4 border-2 rounded-lg transition-all ${
                !settings.useAudioOnly
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSettings(prev => ({ ...prev, useAudioOnly: false }))}
            >
              <Video className="h-8 w-8 mx-auto mb-2" />
              <div className="font-semibold">Video Mode</div>
              <div className="text-sm text-muted-foreground">
                Circular video overlay on website
              </div>
            </button>

            <button
              className={`p-4 border-2 rounded-lg transition-all ${
                settings.useAudioOnly
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSettings(prev => ({ ...prev, useAudioOnly: true }))}
            >
              <ImageIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="font-semibold">Audio + Image</div>
              <div className="text-sm text-muted-foreground">
                Audio with profile picture overlay
              </div>
            </button>
          </div>
        </CardContent>
      </Card>


      {/* Layout Demo */}
      {!settings.useAudioOnly && (
        <VideoLayoutDemo
          initialPosition={settings.position}
          initialSize={settings.size}
          onSettingsChange={(newSettings) => {
            setSettings(prev => ({
              ...prev,
              position: newSettings.position,
              size: newSettings.size
            }));
          }}
        />
      )}


      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview
          </CardTitle>
          <CardDescription>
            Generate test videos for the first 2 prospects to preview your settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleStartPreview}
            disabled={isProcessing}
            variant="outline"
            className="w-full"
          >
            <Eye className="mr-2 h-4 w-4" />
            Generate Preview (2 videos)
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Processing Status */}
      {isProcessing && processingProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 animate-spin" />
              Processing Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress
                value={(processingProgress.completed / processingProgress.total) * 100}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span>
                  {processingProgress.completed} of {processingProgress.total} completed
                </span>
                <span>
                  {processingProgress.failed > 0 && (
                    <span className="text-destructive">
                      {processingProgress.failed} failed
                    </span>
                  )}
                </span>
              </div>
              {processingProgress.current && (
                <div className="text-sm text-muted-foreground">
                  Currently processing: {processingProgress.current}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Action */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Generate Personalized Videos
          </CardTitle>
          <CardDescription>
            Create personalized videos for all {prospectCount} prospects in this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="font-medium">
                  Ready to process {prospectCount} prospects
                </div>
                <div className="text-sm text-muted-foreground">
                  Position: {POSITION_OPTIONS.find(o => o.value === settings.position)?.label}
                  {!settings.useAudioOnly && ` • Size: ${settings.size}px`}
                  • Mode: {settings.useAudioOnly ? 'Audio + Image' : 'Video Overlay'}
                </div>
              </div>
            </div>

            <Button
              onClick={handleStartPersonalization}
              disabled={isProcessing || prospectCount === 0}
              className="w-full"
              size="lg"
            >
              <Play className="mr-2 h-4 w-4" />
              {isProcessing
                ? 'Processing...'
                : `Generate ${prospectCount} Personalized Videos`
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}