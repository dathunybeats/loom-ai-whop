'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { Video, Users, Share2, BarChart3 } from 'lucide-react'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const steps = [
    { icon: Video, title: 'Upload Base Video', desc: 'Record and upload your base talking head video.' },
    { icon: Users, title: 'Import Prospects', desc: 'Upload a CSV of leads to personalize at scale.' },
    { icon: Share2, title: 'Share Landing Pages', desc: 'Send each lead a personalized page.' },
    { icon: BarChart3, title: 'Track Results', desc: 'Measure opens, plays, and conversions.' },
  ]

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1)
    else onComplete()
  }

  const StepIcon = steps[step].icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Getting Started</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid gap-4">
            <Card>
              <CardHeader className="flex items-center gap-3">
                <StepIcon className="h-5 w-5" />
                <CardTitle>{steps[step].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{steps[step].desc}</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>Skip</Button>
            <Button onClick={next}>{step < steps.length - 1 ? 'Next' : 'Finish'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


