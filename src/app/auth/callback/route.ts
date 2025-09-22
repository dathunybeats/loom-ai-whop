import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the newly authenticated user
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        console.log('User authenticated:', user.id, user.email)

        // Create or update user record with retry logic
        const createOrUpdateUser = async (retries = 3) => {
          for (let attempt = 1; attempt <= retries; attempt++) {
            try {
              console.log(`Attempt ${attempt}: Creating/updating user record for:`, user.id)

              // Check if user already exists first
              const { data: existingUser } = await supabase
                .from('users')
                .select('id, plan_id, subscription_status')
                .eq('id', user.id)
                .single()

              if (existingUser) {
                console.log('User already exists, skipping user creation:', existingUser)
                return existingUser
              }

              // Only create new user if they don't exist
              const trialEnd = new Date()
              trialEnd.setDate(trialEnd.getDate() + 7) // 7-day trial

              const { error: insertError, data: userData } = await supabase
                .from('users')
                .insert({
                  id: user.id,
                  email: user.email,
                  full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                  plan_id: 'trial',
                  plan_name: 'Trial',
                  subscription_status: 'trial',
                  current_period_start: new Date().toISOString(),
                  current_period_end: trialEnd.toISOString(),
                  videos_limit: 5,
                  videos_used: 0,
                  billing_period: 'trial',
                  updated_at: new Date().toISOString()
                })
                .select()
                .single()

              const upsertError = insertError

              if (upsertError) {
                console.error(`Attempt ${attempt} failed - Database error creating user:`, {
                  error: upsertError,
                  code: upsertError.code,
                  details: upsertError.details,
                  hint: upsertError.hint,
                  message: upsertError.message,
                  userId: user.id,
                  userEmail: user.email
                })

                if (attempt < retries) {
                  console.log(`Retrying in ${attempt * 1000}ms...`)
                  await new Promise(resolve => setTimeout(resolve, attempt * 1000))
                  continue
                }
              } else {
                console.log('Successfully created new user record:', userData)
                return userData
              }
            } catch (setupError) {
              console.error(`Attempt ${attempt} exception:`, setupError)
              if (attempt < retries) {
                console.log(`Retrying after exception in ${attempt * 1000}ms...`)
                await new Promise(resolve => setTimeout(resolve, attempt * 1000))
                continue
              }
            }
          }
          console.error('All user creation/lookup attempts failed')
          return null
        }

        await createOrUpdateUser()
      }

      // URL to redirect to after sign up process completes
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}