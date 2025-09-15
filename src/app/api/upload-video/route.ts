import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📡 Video upload API called')

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'Missing file or projectId' },
        { status: 400 }
      )
    }

    console.log('📁 Received file:', file.name, file.size, file.type)
    console.log('🆔 Project ID:', projectId)

    // Create Supabase client (server-side, should be more reliable)
    const supabase = await createClient()

    // Get authenticated user from server-side
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ Server auth error:', userError)
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('✅ Server authenticated user:', user.id)

    // Create file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${projectId}/base-video.${fileExt}`

    console.log('⬆️ Uploading to storage:', fileName)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, file, {
        cacheControl: '31536000',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError)
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Storage upload successful:', uploadData)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName)

    console.log('📄 Generated public URL:', publicUrl)

    // Update project in database
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        base_video_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('❌ Database update error:', updateError)
      return NextResponse.json(
        { error: `Database update failed: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Project updated successfully')

    return NextResponse.json({
      success: true,
      videoUrl: publicUrl,
      message: 'Video uploaded successfully'
    })

  } catch (error: any) {
    console.error('💥 Upload API error:', error)
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` },
      { status: 500 }
    )
  }
}