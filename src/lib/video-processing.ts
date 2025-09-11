// Video processing utilities for generating multiple qualities
// Note: This is a foundation for future server-side processing

export interface VideoProcessingConfig {
  quality: string
  width: number
  height: number
  bitrate: string
  suffix: string
}

export const VIDEO_QUALITIES: VideoProcessingConfig[] = [
  {
    quality: '360p',
    width: 640,
    height: 360,
    bitrate: '500k',
    suffix: '_360p'
  },
  {
    quality: '480p',
    width: 854,
    height: 480,
    bitrate: '1M',
    suffix: '_480p'
  },
  {
    quality: '720p',
    width: 1280,
    height: 720,
    bitrate: '2.5M',
    suffix: '_720p'
  }
]

/**
 * Generate FFmpeg commands for different video qualities
 * This would be used server-side with a processing service
 */
export const generateFFmpegCommands = (inputPath: string, outputDir: string) => {
  return VIDEO_QUALITIES.map(config => ({
    quality: config.quality,
    command: [
      'ffmpeg',
      '-i', inputPath,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-vf', `scale=${config.width}:${config.height}`,
      '-b:v', config.bitrate,
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-pix_fmt', 'yuv420p',
      `${outputDir}/video${config.suffix}.mp4`
    ].join(' ')
  }))
}

/**
 * Estimate processing time based on video duration and quality
 */
export const estimateProcessingTime = (durationSeconds: number, qualityCount: number = 3): number => {
  // Rough estimate: 2x video duration per quality
  return durationSeconds * 2 * qualityCount
}

/**
 * Generate poster/thumbnail from video
 */
export const generatePosterCommand = (inputPath: string, outputPath: string, timeOffset: string = '00:00:01') => {
  return `ffmpeg -i ${inputPath} -ss ${timeOffset} -vframes 1 -q:v 2 ${outputPath}`
}

/**
 * For now, simulate multiple quality generation by creating file variants
 * In a real implementation, this would trigger server-side processing
 */
export const simulateQualityGeneration = async (originalFile: File): Promise<{
  qualities: { quality: string; file: File }[]
  poster: string | null
}> => {
  // For now, we'll use the original file for all qualities
  // In production, you'd send this to a processing service
  
  const qualities = VIDEO_QUALITIES.map(config => ({
    quality: config.quality,
    file: new File([originalFile], 
      originalFile.name.replace('.', `${config.suffix}.`), 
      { type: originalFile.type }
    )
  }))

  // Generate a simple poster placeholder
  // In production, this would be extracted from the video
  const poster = null // Would be a base64 image or URL

  return { qualities, poster }
}

/**
 * Upload multiple video qualities to Supabase
 */
import { createClient } from '@/lib/supabase/client'

export const uploadMultipleQualities = async (
  qualities: { quality: string; file: File }[],
  userId: string,
  projectId: string
): Promise<{ quality: string; url: string }[]> => {
  const supabase = createClient()
  const results = []

  for (const { quality, file } of qualities) {
    try {
      const fileName = `${userId}/${projectId}/base-video_${quality}.${file.name.split('.').pop()}`
      
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '31536000',
          upsert: true
        })

      if (error) {
        console.warn(`Failed to upload ${quality}:`, error)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName)

      results.push({
        quality,
        url: publicUrl
      })
    } catch (error) {
      console.error(`Error uploading ${quality}:`, error)
    }
  }

  return results
}

/**
 * Future: API endpoint structure for server-side processing
 */
export interface VideoProcessingJob {
  id: string
  userId: string
  projectId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  originalFileUrl: string
  qualities: {
    quality: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    url?: string
  }[]
  poster?: string
  progress: number
  createdAt: string
  completedAt?: string
}

/**
 * Check if video processing is supported
 */
export const isVideoProcessingSupported = (): boolean => {
  // For now, return false since we don't have server-side processing yet
  // This will be true when we implement the processing service
  return false
}

/**
 * Get the best available quality for a video URL
 * Falls back to original if specific quality doesn't exist
 */
export const getBestAvailableQuality = async (
  baseUrl: string, 
  desiredQualities: string[]
): Promise<string> => {
  for (const quality of desiredQualities) {
    const qualityUrl = baseUrl.replace('.', `_${quality}.`)
    
    try {
      // Test if quality version exists
      const response = await fetch(qualityUrl, { method: 'HEAD' })
      if (response.ok) {
        return qualityUrl
      }
    } catch {
      // Quality doesn't exist, try next
      continue
    }
  }
  
  // Fallback to original
  return baseUrl
}