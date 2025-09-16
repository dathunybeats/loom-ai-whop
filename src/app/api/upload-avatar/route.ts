import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📡 Avatar upload API called')

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('📁 Received file:', file.name, file.size, file.type)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

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

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `avatar-${Date.now()}.${fileExtension}`
    const filePath = `${user.id}/${fileName}`

    console.log('⬆️ Uploading to storage:', filePath)

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer()

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Storage upload successful:', uploadData)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    console.log('📄 Generated public URL:', publicUrl)

    // Update user profile with new avatar URL
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Profile update error:', profileError)
      return NextResponse.json(
        { error: `Failed to update profile: ${profileError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Profile updated successfully')

    return NextResponse.json({
      success: true,
      avatar_url: publicUrl,
      profile: profileData,
      message: 'Avatar uploaded successfully'
    })

  } catch (error: unknown) {
    console.error('💥 Avatar upload API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Avatar upload failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}