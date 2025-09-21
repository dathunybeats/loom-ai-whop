'use client'

import { MicrophoneIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface VoiceRecordingInstructionsProps {
  className?: string
  compact?: boolean
}

export function VoiceRecordingInstructions({ className = '', compact = false }: VoiceRecordingInstructionsProps) {
  if (compact) {
    return (
      <div className={`bg-blue-50 border-l-4 border-blue-400 p-4 ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <MicrophoneIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Recording Instructions
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-1">
                Say <Badge variant="secondary" className="mx-1 bg-blue-100 text-blue-800">PROSPECT</Badge>
                where you want the person's first name to appear.
              </p>
              <p className="text-blue-600 text-xs">
                ✓ Example: "Hey PROSPECT, I saw your business online..."
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MicrophoneIcon className="h-5 w-5 text-blue-600" />
          Voice Recording Instructions
        </CardTitle>
        <CardDescription>
          Follow these steps to create personalized videos for your prospects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold">
              1
            </div>
            <div>
              <h4 className="font-medium">Record your talking head video</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Film yourself speaking naturally to the camera. Keep it conversational and professional.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold">
              2
            </div>
            <div>
              <h4 className="font-medium">
                Say <Badge variant="secondary" className="mx-1">PROSPECT</Badge> for personalization
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                When you want to address the person by name, clearly say the word "PROSPECT"
              </p>
              <div className="bg-gray-50 p-3 rounded-lg mt-2">
                <p className="text-sm">
                  <strong>Example script:</strong><br />
                  "Hey <strong>PROSPECT</strong>, I noticed your business online and wanted to reach out personally.
                  I think I can help you increase your sales..."
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold">
              3
            </div>
            <div>
              <h4 className="font-medium">Upload your prospect list</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Import a CSV file with your prospects' names and business information.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-semibold">
              ✓
            </div>
            <div>
              <h4 className="font-medium text-green-800">AI generates personalized videos</h4>
              <p className="text-sm text-green-700 mt-1">
                Our AI will replace "PROSPECT" with each person's actual name using your voice.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-700">
              <strong>Pro tip:</strong> Speak "PROSPECT" clearly and at the same pace as the rest of your speech for the best results.
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <strong>Important:</strong> Make sure to say "PROSPECT" exactly as written. Our AI will detect this specific word to create the personalization.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VoiceRecordingInstructions