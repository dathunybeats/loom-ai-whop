import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { userProfileSchema } from '@/lib/validations'
import { z } from 'zod'

export async function PUT(request: NextRequest) {
  try {
    console.log('📡 Profile update API called')

    // Get request body
    const body = await request.json()
    console.log('📝 Request body:', body)

    // Validate input - partial update schema
    const updateSchema = userProfileSchema.omit({ id: true }).partial()
    let validatedData
    try {
      validatedData = updateSchema.parse(body)
      console.log('✅ Validation successful:', validatedData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('❌ Validation errors:', error.issues)
        const errorMessage = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        return NextResponse.json(
          { error: `Validation failed: ${errorMessage}` },
          { status: 400 }
        )
      }
      console.error('❌ Unknown validation error:', error)
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Create Supabase client (server-side is more reliable)
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ Server auth error:', userError)
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('✅ Server authenticated user:', user.id)

    // Update user profile in database
    const { data, error } = await supabase
      .from('users')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)

      // Handle specific database errors
      if (error.code === '42501' || error.code === 'PGRST116' ||
          error.message?.includes('permission') ||
          error.message?.includes('RLS') ||
          error.message?.includes('Row Level Security') ||
          error.message?.includes('policy')) {
        return NextResponse.json(
          { error: 'Permission denied. Please check your account status.' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: `Failed to update profile: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Profile updated successfully:', data)

    return NextResponse.json({
      success: true,
      profile: data,
      message: 'Profile updated successfully'
    })

  } catch (error: unknown) {
    console.error('💥 Profile update API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Profile update failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📡 Profile fetch API called')

    // Create Supabase client
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ Server auth error:', userError)
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('✅ Server authenticated user:', user.id)

    // Fetch user data from database
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: `Failed to fetch profile: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Profile fetched successfully')

    return NextResponse.json({
      success: true,
      profile,
      user: {
        id: user.id,
        email: user.email
      }
    })

  } catch (error: unknown) {
    console.error('💥 Profile fetch API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Profile fetch failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}