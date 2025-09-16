'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Crown,
  Video,
  Users,
  BarChart3,
  Download,
  Share2,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  planName?: string
}

export function WelcomeModal({ isOpen, onClose, planName = "Pro" }: WelcomeModalProps) {
  const { planInfo } = useSubscription()

  const planFeatures = {
    'Basic': [
      { icon: Video, title: 'Unlimited Videos', desc: 'Create as many personalized videos as you need' },
      { icon: Download, title: 'Download & Share', desc: 'Download videos and share custom landing pages' },
      { icon: Users, title: 'CSV Upload', desc: 'Bulk import prospects from CSV files' },
    ],
    'Pro': [
      { icon: Video, title: 'Unlimited Videos', desc: 'Create as many personalized videos as you need' },
      { icon: Download, title: '4K Quality', desc: 'Export in ultra-high definition quality' },
      { icon: BarChart3, title: 'Advanced Analytics', desc: 'Track engagement and conversion metrics' },
      { icon: Users, title: 'Team Collaboration', desc: 'Work together with your team members' },
    ],
    'Agency': [
      { icon: Video, title: 'Unlimited Everything', desc: 'Videos, team members, and storage' },
      { icon: Crown, title: 'White Label', desc: 'Brand the platform as your own' },
      { icon: BarChart3, title: 'Enterprise Analytics', desc: 'Advanced reporting and insights' },
      { icon: Users, title: 'Dedicated Support', desc: 'Priority support and account manager' },
    ]
  }

  const currentPlanName = planInfo?.planName || planName
  const features = planFeatures[currentPlanName as keyof typeof planFeatures] || planFeatures['Pro']

  const nextSteps = [
    { icon: Video, title: 'Create Your First Project', desc: 'Upload a video and start personalizing' },
    { icon: Users, title: 'Import Your Prospects', desc: 'Upload a CSV file with your contact list' },
    { icon: Share2, title: 'Share Your Videos', desc: 'Send personalized landing pages to prospects' },
    { icon: BarChart3, title: 'Track Performance', desc: 'Monitor engagement and response rates' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-3xl font-bold flex items-center justify-center gap-2">
              🎉 Welcome to {currentPlanName}!
            </DialogTitle>
            <p className="text-lg text-muted-foreground">
              Your payment was successful! You now have full access to create unlimited personalized videos.
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Plan Features */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              What&apos;s Included in Your Plan
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card key={index} className="border-green-200 bg-green-50/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900">{feature.title}</h4>
                        <p className="text-sm text-green-700 mt-1">{feature.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Get Started in 4 Easy Steps
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {nextSteps.map((step, index) => (
                <Card key={index} className="border-blue-200 bg-blue-50/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                          <step.icon className="h-4 w-4" />
                          {step.title}
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">{step.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Success Message */}
          <Card className="border-primary bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Crown className="h-12 w-12 mx-auto text-primary" />
                <div>
                  <h3 className="text-xl font-bold text-primary mb-2">You&apos;re All Set!</h3>
                  <p className="text-muted-foreground">
                    Your trial videos have been preserved and you now have unlimited access to all features.
                    Time to scale your personalized video campaigns!
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  <Badge variant="secondary" className="px-4 py-2">
                    <Video className="h-4 w-4 mr-2" />
                    Unlimited Videos
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-2">
                    <Download className="h-4 w-4 mr-2" />
                    Full Downloads
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-2">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Button */}
          <div className="text-center">
            <Button onClick={onClose} size="lg" className="px-8">
              <Video className="mr-2 h-4 w-4" />
              Start Creating Videos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Support Info */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>
              Need help getting started? Check out our{' '}
              <a href="#" className="text-primary hover:underline">documentation</a>{' '}
              or{' '}
              <a href="#" className="text-primary hover:underline">contact support</a>.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}