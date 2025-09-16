'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error info for debugging
    this.setState({ error, errorInfo })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Add your error reporting service here (e.g., Sentry, LogRocket)
      // reportError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                We&apos;re sorry, but something unexpected happened. Please try refreshing the page or return to the homepage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-semibold text-sm mb-2">Error Details (Development Only):</h4>
                  <pre className="text-xs text-muted-foreground overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => window.location.reload()}
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

    return this.props.children
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Manual error report:', error, errorInfo)

    if (process.env.NODE_ENV === 'production') {
      // Report to error tracking service
      // reportError(error, errorInfo)
    }
  }
}

// Async error boundary for handling async errors
export function AsyncErrorBoundary({ children, onError }: { children: ReactNode; onError?: (error: Error) => void }) {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      setError(new Error(event.reason))
      setHasError(true)

      if (onError) {
        onError(new Error(event.reason))
      }
    }

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      setError(event.error)
      setHasError(true)

      if (onError) {
        onError(event.error)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [onError])

  if (hasError && error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Async Error Occurred</CardTitle>
            <CardDescription>
              An asynchronous error was caught. Please refresh the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-muted p-4 rounded-md mb-4">
                <pre className="text-xs overflow-auto">{error.toString()}</pre>
              </div>
            )}
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}