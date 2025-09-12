"use client"

import { useState } from "react"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap, Building, ArrowRight } from "lucide-react"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

const plans = [
  {
    id: "plan_TfXAKUpmBXIMA",
    name: "Basic",
    description: "Perfect for individuals getting started",
    price: "$29",
    period: "month",
    icon: Zap,
    popular: false,
    features: [
      "1,000 video generations per month",
      "Basic templates",
      "Email support",
      "HD video quality"
    ]
  },
  {
    id: "plan_N97PuJswksstF",
    name: "Pro",
    description: "Best for growing businesses",
    price: "$99",
    period: "month",
    icon: Crown,
    popular: true,
    features: [
      "Unlimited video generations",
      "Advanced templates",
      "Priority support",
      "4K video quality",
      "Custom branding",
      "Analytics dashboard"
    ]
  },
  {
    id: "plan_HeStJKVzCFSSa",
    name: "Agency",
    description: "For teams and agencies",
    price: "$299",
    period: "month",
    icon: Building,
    popular: false,
    features: [
      "Everything in Pro",
      "Multi-user access",
      "White-label solution",
      "API access",
      "Dedicated account manager",
      "Custom integrations"
    ]
  }
]

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user } = useSubscription()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const generateCheckoutUrl = (planId: string) => {
    if (!user?.email) return "#"

    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://loomai.vercel.app'}/dashboard/upgrade-success?upgraded=true`
    
    const checkoutUrl = new URL(`https://whop.com/checkout/${planId}`)
    checkoutUrl.searchParams.set('prefill_email', user.email)
    checkoutUrl.searchParams.set('redirect_url', redirectUrl)
    
    if (user.id) {
      checkoutUrl.searchParams.set('custom_user_id', user.id)
    }
    
    return checkoutUrl.toString()
  }

  const handlePlanSelect = (planId: string) => {
    setIsLoading(planId)
    const checkoutUrl = generateCheckoutUrl(planId)
    
    // Open checkout in NEW TAB
    window.open(checkoutUrl, '_blank')
    
    // Reset loading state after a moment
    setTimeout(() => {
      setIsLoading(null)
      onClose() // Close modal after opening checkout
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Choose Your Plan</DialogTitle>
          <p className="text-muted-foreground text-center">
            Upgrade from your free trial and unlock powerful features
          </p>
        </DialogHeader>
        
        <div className="grid md:grid-cols-3 gap-6 py-6">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={isLoading !== null}
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
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
        
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day money-back guarantee • Checkout opens in new tab
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}