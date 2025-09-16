'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Oops! Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Please try again or return to the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-semibold text-sm mb-2">Error Details (Development Only):</h4>
              <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                {error.message}
                {error.stack && `\n\nStack trace:\n${error.stack}`}
                {error.digest && `\n\nError ID: ${error.digest}`}
              </pre>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={reset}
              className="flex-1"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}