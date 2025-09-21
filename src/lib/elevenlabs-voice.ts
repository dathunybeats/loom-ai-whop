// ElevenLabs API integration for voice cloning and generation

export interface VoiceCloneResult {
  voiceId: string
  name: string
  previewUrl?: string
}

export interface SpeechGenerationResult {
  audioUrl: string
  audioBlob: Blob
}

export interface ElevenLabsVoice {
  voice_id: string
  name: string
  samples?: Array<{
    sample_id: string
    file_name: string
    mime_type: string
    size_bytes: number
    hash: string
  }>
  category: string
  fine_tuning: {
    model_id: string
    is_allowed_to_fine_tune: boolean
    finetuning_state: string
    verification_failures: string[]
    verification_attempts_count: number
    manual_verification_requested: boolean
  }
  labels: Record<string, string>
  description: string
  preview_url: string
  available_for_tiers: string[]
  settings?: {
    stability: number
    similarity_boost: number
    style: number
    use_speaker_boost: boolean
  }
}

/**
 * Create a voice model from audio sample
 */
export async function cloneVoiceFromAudio(
  audioFile: File,
  voiceName: string,
  description?: string
): Promise<VoiceCloneResult> {
  try {
    console.log('🎭 Starting voice cloning with ElevenLabs')

    const formData = new FormData()
    formData.append('name', voiceName)
    formData.append('files', audioFile)

    if (description) {
      formData.append('description', description)
    }

    // Optional: Add voice settings
    formData.append('labels', JSON.stringify({
      accent: 'american',
      age: 'adult',
      gender: 'neutral',
      use_case: 'personalized_video'
    }))

    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('ElevenLabs clone error:', errorData)
      throw new Error(`Voice cloning failed: ${response.status} ${errorData}`)
    }

    const result = await response.json()
    console.log('✅ Voice cloned successfully:', result.voice_id)

    return {
      voiceId: result.voice_id,
      name: voiceName,
      previewUrl: result.preview_url
    }

  } catch (error) {
    console.error('🚨 Voice cloning error:', error)
    throw new Error(`Voice cloning failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate speech from text using cloned voice
 */
export async function generateSpeechFromText(
  text: string,
  voiceId: string,
  options?: {
    stability?: number
    similarityBoost?: number
    style?: number
    useSpeakerBoost?: boolean
  }
): Promise<SpeechGenerationResult> {
  try {
    console.log(`🎵 Generating speech for: "${text}" with voice ${voiceId}`)

    const requestBody = {
      text,
      model_id: 'eleven_monolingual_v1', // Good for names and short phrases
      voice_settings: {
        stability: options?.stability ?? 0.5,
        similarity_boost: options?.similarityBoost ?? 0.8,
        style: options?.style ?? 0.5,
        use_speaker_boost: options?.useSpeakerBoost ?? true
      }
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('ElevenLabs TTS error:', errorData)
      throw new Error(`Speech generation failed: ${response.status} ${errorData}`)
    }

    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)

    console.log('✅ Speech generated successfully')

    return {
      audioUrl,
      audioBlob
    }

  } catch (error) {
    console.error('🚨 Speech generation error:', error)
    throw new Error(`Speech generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get all available voices for the account
 */
export async function getAvailableVoices(): Promise<ElevenLabsVoice[]> {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`)
    }

    const data = await response.json()
    return data.voices

  } catch (error) {
    console.error('🚨 Error fetching voices:', error)
    throw new Error(`Failed to fetch voices: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Delete a voice model
 */
export async function deleteVoice(voiceId: string): Promise<void> {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete voice: ${response.status}`)
    }

    console.log('✅ Voice deleted successfully')

  } catch (error) {
    console.error('🚨 Error deleting voice:', error)
    throw new Error(`Failed to delete voice: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get voice details
 */
export async function getVoiceDetails(voiceId: string): Promise<ElevenLabsVoice> {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch voice details: ${response.status}`)
    }

    return await response.json()

  } catch (error) {
    console.error('🚨 Error fetching voice details:', error)
    throw new Error(`Failed to fetch voice details: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validate voice settings
 */
export function validateVoiceSettings(settings: {
  stability?: number
  similarityBoost?: number
  style?: number
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (settings.stability !== undefined && (settings.stability < 0 || settings.stability > 1)) {
    errors.push('Stability must be between 0 and 1')
  }

  if (settings.similarityBoost !== undefined && (settings.similarityBoost < 0 || settings.similarityBoost > 1)) {
    errors.push('Similarity boost must be between 0 and 1')
  }

  if (settings.style !== undefined && (settings.style < 0 || settings.style > 1)) {
    errors.push('Style must be between 0 and 1')
  }

  return { valid: errors.length === 0, errors }
}