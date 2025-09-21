'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircleIcon, ExclamationTriangleIcon, MicrophoneIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/components/ui/badge'

interface VoiceDetectionModalProps {
  open: boolean
  onClose: () => void
  videoFile: File | null
  projectId: string
  onDetectionComplete: (result: any) => void
}

interface DetectionResult {
  success: boolean
  detection?: {
    startTime: number
    endTime: number
    confidence: number
    transcript: string
    formattedTime: string
  }
  error?: string
  transcript?: string
}

export function VoiceDetectionModal({
  open,
  onClose,
  videoFile,
  projectId,
  onDetectionComplete
}: VoiceDetectionModalProps) {
  const [detecting, setDetecting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<DetectionResult | null>(null)

  const handleDetection = async () => {
    if (!videoFile) return

    setDetecting(true)
    setProgress(0)
    setResult(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const formData = new FormData()
      formData.append('audioFile', videoFile)
      formData.append('projectId', projectId)

      const response = await fetch('/api/voice/detect-prospect', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()
      setResult(data)

      if (data.success) {
        onDetectionComplete(data)
      }

    } catch (error) {
      console.error('Detection error:', error)
      setResult({
        success: false,
        error: 'Detection failed. Please try again.'
      })
    } finally {
      setDetecting(false)
    }
  }

  const handleRetry = () => {
    setResult(null)
    setProgress(0)
    handleDetection()
  }

  const handleClose = () => {
    if (!detecting) {
      onClose()
      setResult(null)
      setProgress(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MicrophoneIcon className="h-5 w-5 text-blue-600" />
            Detecting "PROSPECT"
          </DialogTitle>
          <DialogDescription>
            We're analyzing your video to find where you said "PROSPECT"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!result && !detecting && (
            <div className="text-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  Make sure you clearly said <Badge variant="secondary">PROSPECT</Badge> in your video
                </p>
              </div>
              <Button onClick={handleDetection} className="w-full">
                Start Detection
              </Button>
            </div>
          )}

          {detecting && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <MicrophoneIcon className="h-6 w-6 text-blue-600 animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Analyzing audio for "PROSPECT"...
                </p>
              </div>

              <Progress value={progress} className="w-full" />

              <p className="text-xs text-center text-muted-foreground">
                This may take 10-30 seconds
              </p>
            </div>
          )}

          {result && result.success && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold text-green-800">PROSPECT Detected!</h3>
                <p className="text-sm text-green-600 mt-1">
                  Found at {result.detection?.formattedTime}
                </p>
              </div>

              {result.detection?.transcript && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Transcript:</p>
                  <p className="text-sm">{result.detection.transcript}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleClose} className="flex-1">
                  Continue
                </Button>
                <Button onClick={handleRetry} variant="outline">
                  Re-detect
                </Button>
              </div>
            </div>
          )}

          {result && !result.success && (
            <div className="space-y-4">
              <div className="text-center">
                <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                <h3 className="font-semibold text-amber-800">PROSPECT Not Detected</h3>
                <p className="text-sm text-amber-600 mt-1">
                  {result.error}
                </p>
              </div>

              {result.transcript && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700 mb-1">What we heard:</p>
                  <p className="text-sm text-amber-800">{result.transcript}</p>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Tips:</strong> Make sure to clearly say "PROSPECT" in your video.
                  Try speaking slower and more clearly.
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
                <Button onClick={handleClose} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VoiceDetectionModal