import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSpeechFromText } from '@/lib/elevenlabs-voice'

export async function POST(request: NextRequest) {
  try {
    console.log('🎵 Starting speech generation API')

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { text, voiceId, prospectId, settings } = await request.json()

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Missing text or voiceId' },
        { status: 400 }
      )
    }

    // Validate text length (names should be short)
    if (text.length > 50) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 50 characters for names.' },
        { status: 400 }
      )
    }

    // Generate speech using ElevenLabs
    const speechResult = await generateSpeechFromText(text, voiceId, {
      stability: settings?.stability || 0.5,
      similarityBoost: settings?.similarityBoost || 0.8,
      style: settings?.style || 0.5,
      useSpeakerBoost: settings?.useSpeakerBoost ?? true
    })

    // Upload audio to Supabase storage
    const fileName = `generated_${prospectId || Date.now()}_${text.replace(/[^a-zA-Z0-9]/g, '')}.mp3`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, speechResult.audioBlob, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    if (uploadError) {
      console.error('Failed to upload generated audio:', uploadError)
      // Return the blob URL as fallback
      return NextResponse.json({
        success: true,
        audioUrl: speechResult.audioUrl,
        audioBlob: speechResult.audioBlob,
        temporary: true
      })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(uploadData.path)

    console.log('✅ Speech generated and uploaded successfully')

    return NextResponse.json({
      success: true,
      audioUrl: publicUrl,
      storageKey: uploadData.path,
      text: text,
      temporary: false
    })

  } catch (error) {
    console.error('🚨 Speech generation API error:', error)
    return NextResponse.json(
      {
        error: 'Speech generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}