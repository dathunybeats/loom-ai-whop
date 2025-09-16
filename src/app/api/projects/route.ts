import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createProjectSchema } from '@/lib/validations'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    console.log('📡 Project creation API called')

    // Get request body
    const body = await request.json()
    console.log('📝 Request body:', body)

    // Validate input
    let validatedData
    try {
      validatedData = createProjectSchema.parse(body)
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

    // Create project in database
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name: validatedData.name,
          description: validatedData.description || null,
          user_id: user.id
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)

      // Handle specific database errors
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A project with this name already exists. Please choose a different name.' },
          { status: 409 }
        )
      }
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
        { error: `Failed to create project: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Project created successfully:', data)

    return NextResponse.json({
      success: true,
      project: data,
      message: 'Project created successfully'
    })

  } catch (error: unknown) {
    console.error('💥 Project creation API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Project creation failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}