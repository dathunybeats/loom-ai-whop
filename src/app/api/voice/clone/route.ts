import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cloneVoiceFromAudio } from '@/lib/elevenlabs-voice'
import { validateAudioFile } from '@/lib/whisper-detection'

export async function POST(request: NextRequest) {
  try {
    console.log('🎭 Starting voice cloning API')

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const audioFile = formData.get('audioFile') as File
    const projectId = formData.get('projectId') as string
    const voiceName = formData.get('voiceName') as string || `Voice_${Date.now()}`

    if (!audioFile || !projectId) {
      return NextResponse.json(
        { error: 'Missing audioFile or projectId' },
        { status: 400 }
      )
    }

    // Validate audio file
    const validation = validateAudioFile(audioFile)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id, name')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Clone voice using ElevenLabs
    const voiceResult = await cloneVoiceFromAudio(
      audioFile,
      `${project.name}_${voiceName}`,
      `Voice clone for project: ${project.name}`
    )

    // Update project with voice model ID
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        voice_model_id: voiceResult.voiceId,
        voice_model_name: voiceResult.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (updateError) {
      console.error('Failed to update project with voice ID:', updateError)
      // Don't fail the request - voice was created successfully
    }

    console.log('✅ Voice cloned successfully')

    return NextResponse.json({
      success: true,
      voice: {
        voiceId: voiceResult.voiceId,
        name: voiceResult.name,
        previewUrl: voiceResult.previewUrl
      }
    })

  } catch (error) {
    console.error('🚨 Voice cloning API error:', error)
    return NextResponse.json(
      {
        error: 'Voice cloning failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}