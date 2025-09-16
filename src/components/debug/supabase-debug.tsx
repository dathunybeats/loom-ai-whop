'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { testSupabaseConnection, testSupabaseAuth } from '@/lib/supabase/test-connection'

export function SupabaseDebug() {
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [authResult, setAuthResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  const handleTestConnection = async () => {
    setTesting(true)
    const result = await testSupabaseConnection()
    setConnectionResult(result)
    setTesting(false)
  }

  const handleTestAuth = async () => {
    setTesting(true)
    const result = await testSupabaseAuth()
    setAuthResult(result)
    setTesting(false)
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Supabase Debug Panel</CardTitle>
        <CardDescription>
          Test Supabase connection and authentication (Development only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={handleTestConnection}
            disabled={testing}
            variant="outline"
          >
            Test Database Connection
          </Button>
          <Button
            onClick={handleTestAuth}
            disabled={testing}
            variant="outline"
          >
            Test Auth Connection
          </Button>
        </div>

        {connectionResult && (
          <div className="space-y-2">
            <h3 className="font-semibold">Database Connection Result:</h3>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
              {JSON.stringify(connectionResult, null, 2)}
            </pre>
          </div>
        )}

        {authResult && (
          <div className="space-y-2">
            <h3 className="font-semibold">Auth Connection Result:</h3>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
              {JSON.stringify(authResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold">Environment Variables:</h3>
          <pre className="bg-muted p-2 rounded text-xs">
            {`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}
NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}