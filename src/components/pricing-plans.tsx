'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Zap, Building } from 'lucide-react'
import { useRouter } from 'next/navigation'

const plans = [
  {
    name: 'Free Trial',
    price: 'Free',
    description: 'Try 5 videos to get started',
    icon: Sparkles,
    features: [
      '5 video credits',
      'Basic AI voice cloning',
      'Standard video quality',
      'Email support',
    ],
    limitations: [
      'Limited to 5 videos',
      'Basic features only',
    ],
    productId: null, // No product ID for free trial
    isTrial: true,
    popular: false,
  },
  {
    name: 'Basic',
    price: '$49.99',
    description: 'Perfect for individuals and small teams',
    icon: Zap,
    features: [
      '100 video credits per month',
      'Advanced AI voice cloning',
      'HD video quality',
      'CSV prospect upload',
      'Email & chat support',
      'Custom branding',
    ],
    productId: 'pdt_ScqkGM6dvih1xrlE04Lwo',
    isTrial: false,
    popular: true,
  },
  {
    name: 'Pro',
    price: '$99',
    description: 'For growing businesses and agencies',
    icon: Building,
    features: [
      '500 video credits per month',
      'Everything in Basic',
      '4K video quality',
      'Advanced analytics',
      'Team collaboration',
      'Priority support',
      'API access',
      'White-label options',
    ],
    productId: 'pdt_hixMn0obmlZ9vyr02Gmgi',
    isTrial: false,
    popular: false,
  },
  {
    name: 'Agency',
    price: '$199',
    description: 'For large teams and enterprise',
    icon: Building,
    features: [
      'Unlimited video credits',
      'Everything in Pro',
      'Unlimited team members',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom training',
      'Enterprise security',
    ],
    productId: 'pdt_pyXVf4I6gL6TY4JkNmOCN',
    isTrial: false,
    popular: false,
  },
]

export function PricingPlans() {
  const router = useRouter()

  const handleFreeTrial = () => {
    router.push('/signup')
  }

  const handlePlanSelect = async (productId: string) => {
    try {
      const response = await fetch('/api/payments/dodo/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: productId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      // Could show a toast notification here
      alert('Failed to start checkout. Please try again.')
    }
  }

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Start with our free trial or choose a plan that fits your needs. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon
          return (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? 'border-primary shadow-lg scale-105'
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">
                  {plan.price}
                  {!plan.isTrial && <span className="text-sm text-muted-foreground">/month</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations?.map((limitation) => (
                    <div key={limitation} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>

                {plan.isTrial ? (
                  <Button 
                    className="w-full" 
                    onClick={handleFreeTrial}
                    variant="outline"
                  >
                    Start Free Trial
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handlePlanSelect(plan.productId!)}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Choose {plan.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground">
          All plans include 30-day money-back guarantee. No setup fees.
        </p>
      </div>
    </div>
  )
}