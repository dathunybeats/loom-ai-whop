'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack,
  SkipForward,
  RotateCcw,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface VideoPlayerProps {
  videoUrl: string
  className?: string
  autoPlay?: boolean
  poster?: string
}

export default function VideoPlayer({ 
  videoUrl, 
  className = '',
  autoPlay = false,
  poster
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const togglePlay = () => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime += seconds
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleDurationChange = () => setDuration(video.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    // Keyboard controls like YouTube
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!video) return
      
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skipTime(-5)
          break
        case 'ArrowRight':
          e.preventDefault()
          skipTime(5)
          break
        case 'ArrowUp':
          e.preventDefault()
          const newVolUp = Math.min(volume + 0.1, 1)
          video.volume = newVolUp
          setVolume(newVolUp)
          break
        case 'ArrowDown':
          e.preventDefault()
          const newVolDown = Math.max(volume - 0.1, 0)
          video.volume = newVolDown
          setVolume(newVolDown)
          break
        case 'KeyF':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'KeyM':
          e.preventDefault()
          toggleMute()
          break
      }
    }

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('volumechange', handleVolumeChange)
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('volumechange', handleVolumeChange)
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [volume, togglePlay, skipTime, toggleFullscreen, toggleMute])

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return
    const time = value[0]
    
    // Create smooth seeking animation
    const currentVideoTime = videoRef.current.currentTime
    const difference = Math.abs(time - currentVideoTime)
    
    if (difference > 0.5) {
      // For larger jumps, seek directly
      videoRef.current.currentTime = time
      setCurrentTime(time)
    } else {
      // For small adjustments, animate smoothly
      const step = (time - currentVideoTime) / 10
      let current = currentVideoTime
      
      const animate = () => {
        if (Math.abs(current - time) < 0.1) {
          videoRef.current!.currentTime = time
          setCurrentTime(time)
          return
        }
        current += step
        videoRef.current!.currentTime = current
        setCurrentTime(current)
        requestAnimationFrame(animate)
      }
      
      animate()
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return
    const newVolume = value[0] / 100
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const changePlaybackRate = (rate: number) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = rate
    setPlaybackRate(rate)
  }

  const restart = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = 0
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 2000) // Shorter timeout like YouTube
  }

  // Always show controls when paused
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying])

  const progress = duration ? (currentTime / duration) * 100 : 0

  if (!videoUrl) {
    return (
      <div className={`bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center rounded-xl shadow-inner ${className}`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
            <Play className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">No video available</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Upload a video to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-xl overflow-hidden shadow-2xl group ${className}`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{ minHeight: '200px' }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        className="w-full h-full object-cover"
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Play Button Overlay - YouTube Style */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200">
          <Button
            onClick={togglePlay}
            size="lg"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black bg-opacity-80 hover:bg-opacity-90 text-white shadow-2xl border-0 transition-all duration-200 hover:scale-110"
          >
            <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" fill="currentColor" />
          </Button>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Bottom Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 backdrop-blur-sm">
          {/* Progress Bar */}
          <div className="px-4 pt-2">
            <div className="relative">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full [&>*]:transition-all [&>*]:duration-200 hover:[&>*]:scale-y-150"
              />
              {/* Buffer indicator (optional) */}
              <div className="absolute top-1/2 left-0 h-1 bg-white bg-opacity-30 rounded-full -translate-y-1/2 pointer-events-none" 
                   style={{ width: `${Math.min(progress + 10, 100)}%` }} />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white px-4 py-3">
            <div className="flex items-center space-x-3">
              {/* Play/Pause */}
              <Button variant="ghost" size="sm" onClick={togglePlay} className="p-1">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              {/* Skip Back */}
              <Button variant="ghost" size="sm" onClick={() => skipTime(-10)} className="p-1">
                <SkipBack className="w-4 h-4" />
              </Button>

              {/* Skip Forward */}
              <Button variant="ghost" size="sm" onClick={() => skipTime(10)} className="p-1">
                <SkipForward className="w-4 h-4" />
              </Button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={toggleMute} className="p-1">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <div className="w-20 hidden sm:block">
                  <Slider
                    value={[volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                  />
                </div>
              </div>

              {/* Time Display */}
              <span className="text-sm font-mono tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Playback Rate */}
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
                    const currentIndex = rates.indexOf(playbackRate)
                    const nextIndex = (currentIndex + 1) % rates.length
                    changePlaybackRate(rates[nextIndex])
                  }}
                  className="text-sm font-medium"
                >
                  {playbackRate}x
                </Button>
              </div>

              {/* Settings */}
              <Button variant="ghost" size="sm" onClick={() => {}} className="p-1">
                <Settings className="w-4 h-4" />
              </Button>

              {/* Fullscreen */}
              <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="p-1">
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}