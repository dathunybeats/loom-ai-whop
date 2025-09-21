import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSpeechFromText } from '@/lib/elevenlabs-voice'

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Starting audio personalization API')

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const {
      originalAudioUrl,
      prospectTiming,
      firstName,
      voiceId,
      prospectId
    } = await request.json()

    if (!originalAudioUrl || !prospectTiming || !firstName || !voiceId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Generate personalized speech for the first name
    console.log(`Generating speech for: "${firstName}"`)
    const speechResult = await generateSpeechFromText(firstName, voiceId, {
      stability: 0.6,      // Slightly more stable for names
      similarityBoost: 0.9, // High similarity for consistency
      style: 0.3,          // Less expressive for names
      useSpeakerBoost: true
    })

    // For MVP: Return the generated audio and timing info
    // The client will handle basic splicing or we'll implement server-side FFmpeg later
    const fileName = `personalized_${prospectId}_${firstName.replace(/[^a-zA-Z0-9]/g, '')}.mp3`

    // Upload the generated name audio
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, speechResult.audioBlob, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    let personalizedNameUrl = speechResult.audioUrl

    if (!uploadError && uploadData) {
      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(uploadData.path)
      personalizedNameUrl = publicUrl
    }

    // Update prospect with personalized audio info
    if (prospectId) {
      await supabase
        .from('prospects')
        .update({
          personalized_audio_url: personalizedNameUrl,
          video_status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', prospectId)
        .eq('user_id', user.id)
    }

    console.log('✅ Audio personalization completed')

    return NextResponse.json({
      success: true,
      personalizedAudio: {
        nameAudioUrl: personalizedNameUrl,
        originalAudioUrl,
        spliceInstructions: {
          beforeEnd: prospectTiming.start,
          afterStart: prospectTiming.end,
          replacementDuration: prospectTiming.end - prospectTiming.start
        }
      },
      prospect: {
        firstName,
        prospectId,
        status: 'processing'
      }
    })

  } catch (error) {
    console.error('🚨 Audio personalization API error:', error)

    // Update prospect status to failed if we have the ID
    const body = await request.json().catch(() => ({}))
    if (body.prospectId) {
      const supabase = await createClient()
      await supabase
        .from('prospects')
        .update({
          video_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', body.prospectId)
    }

    return NextResponse.json(
      {
        error: 'Audio personalization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}