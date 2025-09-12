"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Crown, ArrowRight } from "lucide-react"
import { useSubscription } from "@/contexts/SubscriptionContext"

export default function UpgradeSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { refreshSubscription } = useSubscription()
  const [isRefreshing, setIsRefreshing] = useState(true)

  useEffect(() => {
    // Check if user came from successful upgrade
    const upgraded = searchParams.get('upgraded')
    
    if (upgraded === 'true') {
      // Refresh subscription data to get latest info
      const refreshData = async () => {
        try {
          await refreshSubscription()
        } catch (error) {
          console.error('Failed to refresh subscription:', error)
        } finally {
          setIsRefreshing(false)
        }
      }
      
      // Wait a moment for webhook to process
      setTimeout(refreshData, 2000)
    } else {
      // If not coming from upgrade, redirect to dashboard
      router.push('/dashboard')
    }
  }, [searchParams, refreshSubscription, router])

  const handleContinue = () => {
    router.push('/dashboard')
  }

  if (isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <h3 className="text-lg font-medium">Processing your upgrade...</h3>
              <p className="text-sm text-muted-foreground">
                We're updating your account with the latest subscription information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Upgrade Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Thank you for upgrading your plan! Your account has been successfully updated.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
              <Crown className="h-4 w-4" />
              Welcome to the upgraded experience
            </div>
          </div>
          
          <div className="pt-4">
            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            It may take a moment for all features to be available.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}