import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export async function POST(request: NextRequest) {
  try {
    console.log('📡 Signup API called')

    const body = await request.json()
    console.log('📝 Request body:', {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName
    })

    // Validate input
    let validatedData
    try {
      validatedData = signupSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map(err => err.message).join(', ')
        return NextResponse.json(
          { error: `Validation failed: ${errorMessage}` },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create user account with normal signup process
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          full_name: `${validatedData.firstName} ${validatedData.lastName}`.trim()
        }
      }
    })

    if (error) {
      console.error('❌ Signup error:', error)

      // Handle specific errors
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 }
        )
      }

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many signup attempts. Please wait before trying again.' },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: `Signup failed: ${error.message}` },
        { status: 400 }
      )
    }

    console.log('✅ User signed up successfully:', data.user?.id)

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        // Include any other safe user data
      },
      needsVerification: !data.user?.email_confirmed_at
    })

  } catch (error: unknown) {
    console.error('💥 Signup API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Signup failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}