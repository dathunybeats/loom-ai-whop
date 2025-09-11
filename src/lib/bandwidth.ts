// Bandwidth detection and quality selection utilities

export type VideoQuality = '360p' | '480p' | '720p' | '1080p'
export type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'wifi'

interface BandwidthResult {
  speed: number // Mbps
  quality: VideoQuality
  connectionType?: ConnectionType
}

interface QualityConfig {
  quality: VideoQuality
  minBandwidth: number // Mbps
  resolution: { width: number; height: number }
  bitrate: string
}

export const QUALITY_CONFIGS: QualityConfig[] = [
  {
    quality: '360p',
    minBandwidth: 0.5,
    resolution: { width: 640, height: 360 },
    bitrate: '500k'
  },
  {
    quality: '480p',
    minBandwidth: 1.5,
    resolution: { width: 854, height: 480 },
    bitrate: '1M'
  },
  {
    quality: '720p',
    minBandwidth: 3,
    resolution: { width: 1280, height: 720 },
    bitrate: '2.5M'
  },
  {
    quality: '1080p',
    minBandwidth: 6,
    resolution: { width: 1920, height: 1080 },
    bitrate: '5M'
  }
]

/**
 * Detect user's bandwidth using Network Information API
 */
export const detectBandwidth = async (): Promise<BandwidthResult> => {
  // Try Network Information API first (Chrome/Edge)
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection

  if (connection) {
    const effectiveType = connection.effectiveType
    const downlink = connection.downlink || 1 // Mbps
    
    let estimatedSpeed = downlink
    
    // Map effective types to speeds
    switch (effectiveType) {
      case 'slow-2g':
        estimatedSpeed = Math.max(0.05, downlink)
        break
      case '2g':
        estimatedSpeed = Math.max(0.25, downlink)
        break
      case '3g':
        estimatedSpeed = Math.max(1, downlink)
        break
      case '4g':
        estimatedSpeed = Math.max(5, downlink)
        break
    }

    return {
      speed: estimatedSpeed,
      quality: selectQualityForBandwidth(estimatedSpeed),
      connectionType: effectiveType
    }
  }

  // Fallback: Speed test with small image
  try {
    const speedTestResult = await measureDownloadSpeed()
    return {
      speed: speedTestResult,
      quality: selectQualityForBandwidth(speedTestResult)
    }
  } catch (error) {
    console.warn('Bandwidth detection failed, using default quality:', error)
    // Default to 480p for unknown connections
    return {
      speed: 2,
      quality: '480p'
    }
  }
}

/**
 * Measure download speed by downloading a test file
 */
const measureDownloadSpeed = async (): Promise<number> => {
  const testUrl = 'https://httpbin.org/bytes/100000' // 100KB test file
  const startTime = performance.now()
  
  try {
    const response = await fetch(testUrl, { 
      cache: 'no-cache',
      method: 'GET'
    })
    
    if (!response.ok) {
      throw new Error('Speed test failed')
    }
    
    await response.blob()
    const endTime = performance.now()
    
    const durationMs = endTime - startTime
    const durationSeconds = durationMs / 1000
    const fileSizeMB = 0.1 // 100KB = 0.1MB
    const speedMbps = (fileSizeMB * 8) / durationSeconds // Convert to Mbps
    
    return Math.max(0.1, speedMbps) // Minimum 0.1 Mbps
  } catch (error) {
    console.warn('Speed test failed:', error)
    return 1 // Default 1 Mbps
  }
}

/**
 * Select optimal quality based on bandwidth
 */
export const selectQualityForBandwidth = (bandwidthMbps: number): VideoQuality => {
  // Add buffer (use 70% of available bandwidth)
  const adjustedBandwidth = bandwidthMbps * 0.7
  
  // Find highest quality that fits bandwidth
  for (let i = QUALITY_CONFIGS.length - 1; i >= 0; i--) {
    const config = QUALITY_CONFIGS[i]
    if (adjustedBandwidth >= config.minBandwidth) {
      return config.quality
    }
  }
  
  // Fallback to lowest quality
  return '360p'
}

/**
 * Get quality configuration
 */
export const getQualityConfig = (quality: VideoQuality): QualityConfig => {
  return QUALITY_CONFIGS.find(c => c.quality === quality) || QUALITY_CONFIGS[0]
}

/**
 * Generate video URL with quality suffix
 */
export const getVideoUrlForQuality = (baseUrl: string, quality: VideoQuality): string => {
  if (!baseUrl) return baseUrl
  
  // Extract file parts
  const urlParts = baseUrl.split('/')
  const fileName = urlParts[urlParts.length - 1]
  const basePath = urlParts.slice(0, -1).join('/')
  
  // Add quality suffix before file extension
  const [name, ext] = fileName.split('.')
  const qualityFileName = `${name}_${quality}.${ext}`
  
  return `${basePath}/${qualityFileName}`
}

/**
 * Cache bandwidth result for session
 */
export const cacheBandwidthResult = (result: BandwidthResult): void => {
  try {
    const cacheData = {
      ...result,
      timestamp: Date.now(),
      expires: Date.now() + (30 * 60 * 1000) // 30 minutes
    }
    sessionStorage.setItem('bandwidth_cache', JSON.stringify(cacheData))
  } catch (error) {
    console.warn('Failed to cache bandwidth result:', error)
  }
}

/**
 * Get cached bandwidth result
 */
export const getCachedBandwidthResult = (): BandwidthResult | null => {
  try {
    const cached = sessionStorage.getItem('bandwidth_cache')
    if (!cached) return null
    
    const data = JSON.parse(cached)
    if (Date.now() > data.expires) {
      sessionStorage.removeItem('bandwidth_cache')
      return null
    }
    
    return {
      speed: data.speed,
      quality: data.quality,
      connectionType: data.connectionType
    }
  } catch (error) {
    console.warn('Failed to get cached bandwidth result:', error)
    return null
  }
}