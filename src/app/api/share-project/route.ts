import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the project exists and user has access
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, base_video_url')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error enabling project sharing:', error)
      return NextResponse.json(
        { error: 'Failed to enable sharing for this project' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Check if project has a video to share
    if (!data.base_video_url) {
      return NextResponse.json(
        { error: 'Project must have a video before it can be shared' },
        { status: 400 }
      )
    }

    // Generate the share URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/share/${projectId}`

    return NextResponse.json({
      success: true,
      shareUrl,
      projectName: data.name,
      isShared: true
    })

  } catch (error: any) {
    console.error('Share project API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
