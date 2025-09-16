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

        // Check if user already has a subscription
        try {
          const { data: existingSub } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .limit(1)

          if (!existingSub || existingSub.length === 0) {
            // Look for unlinked subscriptions that might belong to this user
            const { data: unlinkedSubs } = await supabase
              .from('user_subscriptions')
              .select('*')
              .is('user_id', null)
              .limit(1)

            if (unlinkedSubs && unlinkedSubs.length > 0) {
              console.log('Found unlinked subscription, attempting to link...')

              // Link the first unlinked subscription to this user
              const { error: linkError } = await supabase
                .from('user_subscriptions')
                .update({ user_id: user.id })
                .eq('id', unlinkedSubs[0].id)

              if (!linkError) {
                console.log('Successfully linked subscription to user')
              } else {
                console.error('Failed to link subscription:', linkError)
              }
            } else {
              // No existing subscription and no unlinked subscription - create trial
              console.log('Creating trial subscription for new user:', user.id)

              // No time limit, only video count limit
              const { error: trialError, data: trialData } = await supabase
                .from('user_subscriptions')
                .insert({
                  user_id: user.id,
                  plan_id: 'trial',
                  whop_subscription_id: null,
                  status: 'trial',
                  current_period_start: new Date().toISOString(),
                  current_period_end: new Date('2099-12-31').toISOString(), // Far future date (no time limit)
                  videos_limit: 5,
                  videos_used: 0
                })
                .select()
                .single()

              if (trialError) {
                console.error('Failed to create trial subscription:', trialError)
              } else {
                console.log('Successfully created trial subscription:', trialData)
              }
            }
          } else {
            console.log('User already has a subscription')
          }

          // Create/update profile
          try {
            await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                email: user.email
              }, { onConflict: 'id' })
          } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown error'
            console.warn('Profile creation failed:', errorMessage)
          }

        } catch (linkError) {
          console.warn('Subscription setup failed:', linkError)
        }
      }

      // URL to redirect to after sign up process completes
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}