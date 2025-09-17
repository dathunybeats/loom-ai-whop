'use client'

import { Check, MoveRight, PhoneCall, Sparkles, Zap, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const plans = [
  {
    name: 'Free Trial',
    monthlyPrice: 'Free',
    annualPrice: 'Free',
    monthlyOriginalPrice: null,
    annualOriginalPrice: null,
    description: 'Try 5 videos to get started',
    icon: Sparkles,
    features: [
      { name: '5 video credits', description: 'Create personalized videos' },
      { name: 'Basic AI voice cloning', description: 'Standard voice personalization' },
      { name: 'Standard video quality', description: 'HD video output' },
      { name: 'Email support', description: 'Get help when you need it' },
    ],
    productId: null,
    annualProductId: null,
    isTrial: true,
    popular: false,
    buttonText: 'Start Free Trial',
    buttonVariant: 'outline' as const,
  },
  {
    name: 'Basic',
    monthlyPrice: '$49.99',
    annualPrice: '$41.65',
    monthlyOriginalPrice: null,
    annualOriginalPrice: '$49.99',
    description: 'Perfect for individuals and small teams',
    icon: Zap,
    features: [
      { name: '100 video credits/month', description: 'Create personalized videos at scale' },
      { name: 'Advanced AI voice cloning', description: 'High-quality voice synthesis' },
      { name: 'HD video quality', description: 'Professional-grade video output' },
      { name: 'CSV prospect upload', description: 'Bulk import prospect data' },
      { name: 'Custom branding', description: 'Add your logo and colors' },
    ],
    productId: 'pdt_ScqkGM6dvih1xrlE04Lwo',
    annualProductId: 'pdt_ScqkGM6dvih1xrlE04Lwo_annual',
    isTrial: false,
    popular: true,
    buttonText: 'Get Started',
    buttonVariant: 'default' as const,
  },
  {
    name: 'Pro',
    monthlyPrice: '$99',
    annualPrice: '$82.50',
    monthlyOriginalPrice: null,
    annualOriginalPrice: '$99',
    description: 'For growing businesses and agencies',
    icon: Building,
    features: [
      { name: '500 video credits/month', description: 'Scale your outreach campaigns' },
      { name: 'Everything in Basic', description: 'All Basic plan features' },
      { name: '4K video quality', description: 'Ultra-high definition output' },
      { name: 'Advanced analytics', description: 'Detailed performance insights' },
      { name: 'Team collaboration', description: 'Share projects with your team' },
    ],
    productId: 'pdt_hixMn0obmlZ9vyr02Gmgi',
    annualProductId: 'pdt_hixMn0obmlZ9vyr02Gmgi_annual',
    isTrial: false,
    popular: false,
    buttonText: 'Choose Pro',
    buttonVariant: 'outline' as const,
  },
  {
    name: 'Agency',
    monthlyPrice: '$199',
    annualPrice: '$165.85',
    monthlyOriginalPrice: null,
    annualOriginalPrice: '$199',
    description: 'For large teams and enterprise',
    icon: Building,
    features: [
      { name: 'Unlimited video credits', description: 'No limits on video creation' },
      { name: 'Everything in Pro', description: 'All Pro plan features' },
      { name: 'Unlimited team members', description: 'Scale your team without limits' },
      { name: 'Custom integrations', description: 'Tailored to your workflow' },
      { name: 'Dedicated account manager', description: 'Personal support contact' },
    ],
    productId: 'pdt_pyXVf4I6gL6TY4JkNmOCN',
    annualProductId: 'pdt_pyXVf4I6gL6TY4JkNmOCN_annual',
    isTrial: false,
    popular: false,
    buttonText: 'Book a meeting',
    buttonVariant: 'outline' as const,
  },
]

function Pricing() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnnual, setIsAnnual] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    checkUser()
  }, [supabase])

  const handleFreeTrial = () => {
    router.push('/signup')
  }

  const handlePlanSelect = async (plan: any) => {
    // Handle free trial
    if (!plan.productId) {
      handleFreeTrial()
      return
    }

    // Handle Agency plan - book a meeting
    if (plan.name === 'Agency') {
      // You can replace this with your actual booking link
      window.open('https://calendly.com/your-booking-link', '_blank')
      return
    }

    // Select the appropriate product ID based on billing period
    const selectedProductId = isAnnual ? plan.annualProductId : plan.productId

    // Check if user is authenticated
    if (!user) {
      router.push(`/signup?plan=${selectedProductId}`)
      return
    }

    try {
      const response = await fetch('/api/payments/dodo/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedProductId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Checkout API error:', errorData)
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start checkout. Please try again.')
    }
  }

  return (
    <div className="w-full py-16 lg:py-20">
      <div className="container mx-auto px-8 lg:px-16">
        <div className="flex text-center justify-center items-center gap-6 flex-col">
          <Badge>Pricing</Badge>
          <div className="flex gap-3 flex-col">
            <h2 className="text-3xl md:text-4xl tracking-tighter max-w-2xl text-center font-regular">
              Prices that make sense!
            </h2>
            <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Start with our free trial or choose a plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center gap-4 p-2 bg-muted rounded-lg">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual
              </span>
              <Badge variant="secondary" className="text-xs">
                Save 17%
              </Badge>
            </div>
          </div>

          <div className="grid pt-12 text-left grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full gap-6 max-w-6xl">
            {plans.map((plan) => {
              const Icon = plan.icon
              const isPopular = plan.popular
              const isAgency = plan.name === 'Agency'
              const currentPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice
              const originalPrice = isAnnual ? plan.annualOriginalPrice : plan.monthlyOriginalPrice
              const hasDiscount = isAnnual && originalPrice && originalPrice !== currentPrice

              return (
                <Card
                  key={plan.name}
                  className={`w-full rounded-lg relative hover:shadow-lg transition-shadow ${
                    isPopular ? 'shadow-xl border-primary scale-105' : ''
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}

                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">
                      <span className="flex flex-row gap-3 items-center">
                        <Icon className="h-5 w-5 text-primary" />
                        {plan.name}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-6 justify-start">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">{currentPrice}</span>
                          {hasDiscount && (
                            <span className="text-lg text-muted-foreground line-through">
                              {originalPrice}
                            </span>
                          )}
                          {!plan.isTrial && (
                            <span className="text-sm text-muted-foreground">
                              /{isAnnual ? 'year' : 'month'}
                            </span>
                          )}
                        </div>
                        {isAnnual && hasDiscount && (
                          <Badge variant="secondary" className="w-fit mt-1 text-xs">
                            17% off
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 justify-start">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex flex-row gap-3">
                            <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                            <div className="flex flex-col">
                              <p className="text-sm font-medium">{feature.name}</p>
                              <p className="text-muted-foreground text-xs">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant={plan.buttonVariant}
                        className="gap-2 w-full"
                        onClick={() => handlePlanSelect(plan)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Loading...' : plan.buttonText}
                        {isAgency ? (
                          <PhoneCall className="w-4 h-4" />
                        ) : (
                          <MoveRight className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              All plans include 30-day money-back guarantee. No setup fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Pricing };