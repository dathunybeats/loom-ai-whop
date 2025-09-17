import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Reduce token refresh frequency (default is 3600s/1h, we'll extend to 4h)
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Reduce how often it checks for session changes
        flowType: 'pkce'
      }
    }
  )
}