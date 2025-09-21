// Audio processing utilities for splicing and manipulation

export interface AudioSegment {
  startTime: number
  endTime: number
  audioUrl?: string
  audioBlob?: Blob
}

export interface SpliceOptions {
  originalAudio: string | Blob
  replacementAudio: string | Blob
  replaceAtTime: { start: number; end: number }
  outputFormat?: 'mp3' | 'wav' | 'webm'
}

/**
 * Extract audio from video file using Web APIs
 */
export async function extractAudioFromVideo(videoFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'

    video.onloadedmetadata = async () => {
      try {
        // Create audio context
        const audioContext = new AudioContext()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // For now, return the original file as-is
        // In production, you'd use FFmpeg.js or server-side processing
        const audioBlob = new Blob([videoFile], { type: 'audio/mp3' })
        resolve(audioBlob)

      } catch (error) {
        reject(error)
      }
    }

    video.onerror = () => reject(new Error('Failed to load video'))
    video.src = URL.createObjectURL(videoFile)
  })
}

/**
 * Convert blob to File with specific name and type
 */
export function blobToFile(blob: Blob, fileName: string, mimeType: string = 'audio/mp3'): File {
  return new File([blob], fileName, { type: mimeType })
}

/**
 * Simple audio splicing using Web Audio API (for basic operations)
 */
export async function spliceAudioBasic(options: SpliceOptions): Promise<Blob> {
  try {
    console.log('🔧 Starting basic audio splice')

    // For MVP, we'll use server-side processing
    // This function prepares the data for API call
    const formData = new FormData()

    if (typeof options.originalAudio === 'string') {
      const response = await fetch(options.originalAudio)
      const blob = await response.blob()
      formData.append('originalAudio', blob, 'original.mp3')
    } else {
      formData.append('originalAudio', options.originalAudio, 'original.mp3')
    }

    if (typeof options.replacementAudio === 'string') {
      const response = await fetch(options.replacementAudio)
      const blob = await response.blob()
      formData.append('replacementAudio', blob, 'replacement.mp3')
    } else {
      formData.append('replacementAudio', options.replacementAudio, 'replacement.mp3')
    }

    formData.append('replaceStart', options.replaceAtTime.start.toString())
    formData.append('replaceEnd', options.replaceAtTime.end.toString())
    formData.append('outputFormat', options.outputFormat || 'mp3')

    // Call our API endpoint that handles server-side splicing
    const response = await fetch('/api/audio/splice', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Audio splicing failed: ${response.status}`)
    }

    return await response.blob()

  } catch (error) {
    console.error('🚨 Audio splicing error:', error)
    throw new Error(`Audio splicing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate personalized audio for a prospect
 */
export async function generatePersonalizedAudio(
  originalAudioUrl: string,
  prospectTiming: { start: number; end: number },
  firstName: string,
  voiceId: string
): Promise<Blob> {
  try {
    console.log(`🎯 Generating personalized audio for: ${firstName}`)

    // Call our API endpoint that handles the full process
    const response = await fetch('/api/audio/personalize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalAudioUrl,
        prospectTiming,
        firstName,
        voiceId
      })
    })

    if (!response.ok) {
      throw new Error(`Personalization failed: ${response.status}`)
    }

    return await response.blob()

  } catch (error) {
    console.error('🚨 Personalization error:', error)
    throw new Error(`Audio personalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Upload blob to Supabase storage
 */
export async function uploadAudioToStorage(
  audioBlob: Blob,
  fileName: string,
  bucket: string = 'audio'
): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', audioBlob, fileName)
    formData.append('bucket', bucket)

    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    const { url } = await response.json()
    return url

  } catch (error) {
    console.error('🚨 Upload error:', error)
    throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Download audio from URL as blob
 */
export async function downloadAudioAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download audio: ${response.status}`)
  }
  return await response.blob()
}

/**
 * Get audio duration from file
 */
export async function getAudioDuration(audioFile: File | Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()

    audio.onloadedmetadata = () => {
      resolve(audio.duration)
    }

    audio.onerror = () => reject(new Error('Failed to load audio'))

    audio.src = URL.createObjectURL(audioFile)
  })
}

/**
 * Validate audio file
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024 // 50MB
  const supportedTypes = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 50MB' }
  }

  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type' }
  }

  return { valid: true }
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format duration to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}