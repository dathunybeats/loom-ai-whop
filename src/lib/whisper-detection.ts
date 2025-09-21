// Whisper API integration for detecting "PROSPECT" in audio
import OpenAI from 'openai'

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export interface ProspectDetectionResult {
  detected: boolean
  startTime: number
  endTime: number
  confidence: number
  transcript?: string
}

export interface WhisperWord {
  word: string
  start: number
  end: number
}

export interface WhisperTranscription {
  text: string
  words?: WhisperWord[]
}

/**
 * Detect "PROSPECT" placeholder in audio using OpenAI Whisper
 */
export async function detectProspectInAudio(
  audioFile: File
): Promise<ProspectDetectionResult> {
  try {
    console.log('🎤 Starting Whisper transcription for PROSPECT detection')

    // Transcribe with word-level timestamps
    const openai = getOpenAIClient()
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
      language: 'en', // Force English for better accuracy
    })

    console.log('📝 Transcription completed:', transcription.text)

    // Find "prospect" in the word-level timestamps
    const words = (transcription as any).words as WhisperWord[]

    if (!words || words.length === 0) {
      console.warn('⚠️ No word-level timestamps returned')
      return { detected: false, startTime: 0, endTime: 0, confidence: 0 }
    }

    // Look for "prospect" (case-insensitive)
    const prospectWord = words.find(word =>
      word.word.toLowerCase().includes('prospect')
    )

    if (prospectWord) {
      console.log('✅ Found PROSPECT at:', prospectWord.start, '-', prospectWord.end)

      return {
        detected: true,
        startTime: prospectWord.start,
        endTime: prospectWord.end,
        confidence: 1.0,
        transcript: transcription.text
      }
    }

    console.log('❌ PROSPECT not found in transcription')
    return {
      detected: false,
      startTime: 0,
      endTime: 0,
      confidence: 0,
      transcript: transcription.text
    }

  } catch (error) {
    console.error('🚨 Whisper detection error:', error)
    throw new Error(`Speech recognition failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract audio from video file (for browser use)
 */
export async function extractAudioFromVideo(videoFile: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const audioContext = new AudioContext()

    video.onloadedmetadata = () => {
      // For now, return the original file
      // In production, you'd use FFmpeg or server-side processing
      resolve(videoFile)
    }

    video.onerror = () => reject(new Error('Failed to load video'))
    video.src = URL.createObjectURL(videoFile)
  })
}

/**
 * Validate audio file for Whisper API
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 25 * 1024 * 1024 // 25MB limit
  const supportedTypes = [
    'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 25MB' }
  }

  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type. Use MP3, MP4, WAV, or WebM' }
  }

  return { valid: true }
}

/**
 * Format time for display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(1)
  return `${mins}:${secs.padStart(4, '0')}`
}