import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📡 Onboarding update API called')

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

    console.log('✅ Updating onboarding status for user:', user.id)

    // Update the user's onboarding_completed status
    const { error } = await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: `Failed to update onboarding status: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Onboarding status updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Onboarding status updated successfully'
    })

  } catch (error: unknown) {
    console.error('💥 Onboarding update API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Onboarding update failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}