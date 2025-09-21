import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { detectProspectInAudio, validateAudioFile } from '@/lib/whisper-detection'

export async function POST(request: NextRequest) {
  try {
    console.log('🎤 Starting PROSPECT detection API')

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
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Detect PROSPECT in audio
    const detection = await detectProspectInAudio(audioFile)

    if (!detection.detected) {
      return NextResponse.json({
        success: false,
        error: 'Could not detect "PROSPECT" in your audio. Please re-record and clearly say "PROSPECT" where you want the first name to appear.',
        transcript: detection.transcript
      })
    }

    // Update project with detection timing
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        prospect_timing: {
          start: detection.startTime,
          end: detection.endTime,
          confidence: detection.confidence
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (updateError) {
      console.error('Failed to update project:', updateError)
      return NextResponse.json(
        { error: 'Failed to save detection data' },
        { status: 500 }
      )
    }

    console.log('✅ PROSPECT detected successfully')

    return NextResponse.json({
      success: true,
      detection: {
        startTime: detection.startTime,
        endTime: detection.endTime,
        confidence: detection.confidence,
        transcript: detection.transcript,
        formattedTime: `${detection.startTime.toFixed(1)}s - ${detection.endTime.toFixed(1)}s`
      }
    })

  } catch (error) {
    console.error('🚨 Detection API error:', error)
    return NextResponse.json(
      {
        error: 'Detection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}