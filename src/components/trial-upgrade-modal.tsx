'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Zap, Building, ArrowRight, Sparkles } from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'

interface TrialUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

const plans = [
  {
    id: "pdt_ScqkGM6dvih1xrlE04Lwo",
    name: "Basic",
    description: "Perfect for individuals getting started",
    price: "$49.99",
    period: "month",
    icon: Zap,
    popular: false,
    features: [
      "Unlimited video generation",
      "HD video quality",
      "CSV prospect upload",
      "Email support",
      "Custom branding",
      "Basic analytics"
    ],
    checkoutUrl: ''
  },
  {
    id: "pdt_hixMn0obmlZ9vyr02Gmgi",
    name: "Pro",
    description: "Best for growing businesses",
    price: "$99",
    period: "month",
    icon: Crown,
    popular: true,
    features: [
      "Everything in Basic",
      "4K video quality",
      "Advanced analytics",
      "Team collaboration",
      "Priority support",
      "API access",
      "White-label options"
    ],
    checkoutUrl: ''
  },
  {
    id: "pdt_pyXVf4I6gL6TY4JkNmOCN",
    name: "Agency",
    description: "For teams and agencies",
    price: "$199",
    period: "month",
    icon: Building,
    popular: false,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom training",
      "Enterprise security"
    ],
    checkoutUrl: ''
  }
]

export function TrialUpgradeModal({ isOpen, onClose }: TrialUpgradeModalProps) {
  const { user } = useSubscription()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const createCheckout = async (plan: typeof plans[0]) => {
    const resp = await fetch('/api/payments/dodo/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: plan.id, metadata: { plan_name: plan.name } })
    })
    if (!resp.ok) throw new Error('Failed to create checkout')
    const data = await resp.json()
    return data.url as string
  }

  const handlePlanSelect = async (plan: typeof plans[0]) => {
    try {
      setIsLoading(plan.id)
      const url = await createCheckout(plan)
      window.open(url, '_blank')
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => setIsLoading(null), 1000)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent hideCloseButton className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Your Trial is Complete!
          </DialogTitle>
          <p className="text-lg text-muted-foreground text-center">
            You&apos;ve experienced the power of personalized videos. Choose a plan to unlock unlimited creation.
          </p>
        </DialogHeader>

        {/* Trial Summary */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-6">
          <div className="text-center space-y-1.5">
            <h3 className="text-xl font-semibold">🎉 Trial Complete!</h3>
            <p className="text-muted-foreground">
              You&apos;ve just created personalized videos and experienced:
            </p>
            <div className="flex justify-center gap-4 text-sm mt-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>AI Video Personalization</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Share Link Generation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>GIF Previews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-200 ${
                  plan.popular
                    ? 'border-primary shadow-lg bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm min-h-[40px] flex items-center justify-center">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <ul className="space-y-1.5 min-h-[120px]">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={isLoading !== null}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {isLoading === plan.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                        Opening checkout...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Choose {plan.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

      </DialogContent>
    </Dialog>
  )
}










