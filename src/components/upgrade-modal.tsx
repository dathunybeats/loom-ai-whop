'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Zap, Building, ArrowRight, Sparkles } from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { motion, AnimatePresence } from 'framer-motion'

interface UpgradeModalProps {
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

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user } = useSubscription()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

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

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan.id)
  }

  const handleUpgradeNow = async () => {
    if (!selectedPlan) return

    const plan = plans.find(p => p.id === selectedPlan)
    if (!plan) return

    try {
      setIsLoading(selectedPlan)
      const url = await createCheckout(plan)
      window.open(url, '_blank')
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => setIsLoading(null), 1000)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={() => {}} modal>
          <DialogContent className="max-w-lg border-0 shadow-none bg-transparent p-0 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className="bg-background border rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, scale: 0.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
                duration: 0.5
              }}
              style={{
                transformOrigin: "50% 50%"
              }}
            >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Ready to Scale Your Outreach?</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Choose the best plan for your video personalization needs
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Plan Cards */}
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`border-2 rounded-lg p-4 flex items-center justify-between cursor-pointer focus:outline-none transition-colors ${
                selectedPlan === plan.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200'
              }`}
              onClick={() => handlePlanSelect(plan)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              whileHover={{
                scale: 1.02
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div>
                <h3 className="font-medium text-base">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="text-right">
                <span className="font-semibold">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
            </motion.div>
          ))}

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground mt-6">
            By continuing, you agree to our <span className="underline cursor-pointer">Terms</span>
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="mr-1">🔒</span>
              Payment secured by Stripe
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                disabled={isLoading !== null || !selectedPlan}
                onClick={handleUpgradeNow}
              >
                {isLoading ? "Processing..." : selectedPlan ? "Upgrade Now" : "Select a Plan"}
              </Button>
            </div>
          </div>
            </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}










