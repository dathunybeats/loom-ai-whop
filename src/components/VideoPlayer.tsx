'use client'

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  Settings,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  videoUrl?: string
  poster?: string
  className?: string
  autoPlay?: boolean
}

const FALLBACK_VIDEO_SRC =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00'
  }

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return `${m}:${s.toString().padStart(2, '0')}`
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  poster,
  className,
  autoPlay = false,
}) => {
  const resolvedSrc = videoUrl || FALLBACK_VIDEO_SRC

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)
  const volumeRef = useRef<HTMLDivElement | null>(null)
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [buffered, setBuffered] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDraggingVolume, setIsDraggingVolume] = useState(false)
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false)

  const hideControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }, [isPlaying])

  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    hideControlsTimeout()
  }, [hideControlsTimeout])

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (video.paused || video.ended) {
      const playPromise = video.play()
      playPromise?.catch(() => {})
    } else {
      video.pause()
    }
  }, [])

  const handleProgressClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const progressEl = progressRef.current
      const video = videoRef.current
      if (!progressEl || !video || !duration) return

      const rect = progressEl.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const ratio = Math.min(Math.max(clickX / rect.width, 0), 1)
      const newTime = ratio * duration

      video.currentTime = newTime
      setCurrentTime(newTime)
    },
    [duration],
  )

  const handleVolumeChange = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const volumeEl = volumeRef.current
      const video = videoRef.current
      if (!volumeEl || !video) return

      const rect = volumeEl.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const ratio = Math.min(Math.max(clickX / rect.width, 0), 1)

      setVolume(ratio)
      setIsMuted(ratio === 0)
      video.volume = ratio
      video.muted = ratio === 0
    },
    [],
  )

  const handleVolumeMouseDown = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    setIsDraggingVolume(true)
    handleVolumeChange(event)
    event.preventDefault()
  }, [handleVolumeChange])

  const handleVolumeMouseMove = useCallback((event: MouseEvent) => {
    if (!isDraggingVolume) return

    const volumeEl = volumeRef.current
    const video = videoRef.current
    if (!volumeEl || !video) return

    const rect = volumeEl.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const ratio = Math.min(Math.max(clickX / rect.width, 0), 1)

    setVolume(ratio)
    setIsMuted(ratio === 0)
    video.volume = ratio
    video.muted = ratio === 0
  }, [isDraggingVolume])

  const handleVolumeMouseUp = useCallback(() => {
    setIsDraggingVolume(false)
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (isMuted || volume === 0) {
      const nextVolume = volume === 0 ? 0.5 : volume
      setIsMuted(false)
      setVolume(nextVolume)
      video.muted = false
      video.volume = nextVolume
    } else {
      setIsMuted(true)
      video.muted = true
    }
  }, [isMuted, volume])

  const skip = useCallback(
    (seconds: number) => {
      const video = videoRef.current
      if (!video) return

      const target = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds))
      video.currentTime = target
      setCurrentTime(target)
    },
    [],
  )

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.()
    }
  }, [])

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed)
    setShowSpeedMenu(false)

    const video = videoRef.current
    if (video) {
      video.playbackRate = speed
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0)
      setIsLoading(false)
    }
    const handleProgress = () => {
      if (video.buffered.length > 0 && video.duration) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const bufferedAmount = (bufferedEnd / video.duration) * 100
        setBuffered(bufferedAmount)
      }
    }
    const handleWaiting = () => setIsLoading(true)
    const handlePlaying = () => {
      setIsLoading(false)
      setIsPlaying(true)
      setHasPlayedOnce(true)
    }
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('progress', handleProgress)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('progress', handleProgress)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [resolvedSrc])

  useEffect(() => {
    if (isPlaying) {
      hideControlsTimeout()
    } else {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      setShowControls(true)
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [hideControlsTimeout, isPlaying])

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const effectiveVolume = isMuted ? 0 : volume
    video.volume = effectiveVolume
    video.muted = isMuted
  }, [isMuted, volume])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = playbackSpeed
  }, [playbackSpeed])

  useEffect(() => {
    setIsLoading(true)
    setCurrentTime(0)
    setDuration(0)
    setBuffered(0)
    setIsPlaying(false)
    setShowControls(true)

    const video = videoRef.current
    if (video) {
      video.load()
      if (autoPlay) {
        const playPromise = video.play()
        playPromise?.catch(() => {})
      }
    }
  }, [autoPlay, resolvedSrc])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const container = containerRef.current
      setIsFullscreen(document.fullscreenElement === container)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Handle global mouse events for volume dragging
  useEffect(() => {
    if (isDraggingVolume) {
      document.addEventListener('mousemove', handleVolumeMouseMove)
      document.addEventListener('mouseup', handleVolumeMouseUp)
    } else {
      document.removeEventListener('mousemove', handleVolumeMouseMove)
      document.removeEventListener('mouseup', handleVolumeMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleVolumeMouseMove)
      document.removeEventListener('mouseup', handleVolumeMouseUp)
    }
  }, [isDraggingVolume, handleVolumeMouseMove, handleVolumeMouseUp])

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0
  const bufferedPercentage = Math.min(buffered, 100)

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full bg-black rounded-3xl overflow-hidden shadow-2xl group',
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={resolvedSrc}
        poster={poster}
        className="w-full h-full cursor-pointer"
        onClick={togglePlayPause}
        playsInline
        preload="metadata"
        autoPlay={autoPlay}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div
        className={cn(
          'absolute inset-0 pointer-events-none transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
          <button
            type="button"
            onClick={togglePlayPause}
            className="transform transition-all duration-200 hover:scale-110 cursor-pointer"
          >
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_1_2)">
                <path opacity="0.3" d="M45 90C69.8529 90 90 69.8527 90 44.9999C90 20.1471 69.8529 0 45 0C20.1472 0 0 20.1471 0 44.9999C0 69.8527 20.1472 90 45 90Z" fill="#282828"/>
                <path d="M45 85C67.0914 85 85 67.0913 85 44.9999C85 22.9086 67.0914 5 45 5C22.9086 5 5 22.9086 5 44.9999C5 67.0913 22.9086 85 45 85Z" fill="#303030"/>
                <path opacity="0.8" d="M35 33.268V56.732C35 58.5212 37.0582 59.6083 38.6432 58.6344L57.8999 46.9025C59.3667 46.0192 59.3667 43.9808 57.8999 43.0749L38.6432 31.3656C37.0582 30.3917 35 31.4788 35 33.268Z" fill="white"/>
              </g>
              <defs>
                <clipPath id="clip0_1_2">
                  <rect width="90" height="90" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </button>
        </div>
      )}

      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-4 transition-all duration-300',
          showControls && hasPlayedOnce ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        )}
      >
        <div className="mb-4 px-2">
          <div
            ref={progressRef}
            className="relative h-1 bg-white/20 rounded-full cursor-pointer group/progress"
            onClick={handleProgressClick}
          >
            <div
              className="absolute h-full bg-white/30 rounded-full"
              style={{ width: `${bufferedPercentage}%` }}
            />

            <div
              className="absolute h-full bg-white rounded-full transition-all duration-150 group-hover/progress:h-1.5"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 text-white">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={togglePlayPause}
              className="hover:scale-110 transition-transform cursor-pointer"
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                  <path fillRule="evenodd" clipRule="evenodd" d="M2 3C2 2.46957 2.21071 1.96086 2.58579 1.58579C2.96086 1.21071 3.46957 1 4 1H5C5.53043 1 6.03914 1.21071 6.41421 1.58579C6.78929 1.96086 7 2.46957 7 3V13C7 13.5304 6.78929 14.0391 6.41421 14.4142C6.03914 14.7893 5.53043 15 5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V3ZM9 3C9 2.46957 9.21071 1.96086 9.58579 1.58579C9.96086 1.21071 10.4696 1 11 1H12C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V13C14 13.5304 13.7893 14.0391 13.4142 14.4142C13.0391 14.7893 12.5304 15 12 15H11C10.4696 15 9.96086 14.7893 9.58579 14.4142C9.21071 14.0391 9 13.5304 9 13V3Z" fill="white"/>
                </svg>
              ) : (
                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0 3.00343C0 0.723427 2.445 -0.724073 4.4445 0.375427L17.7975 7.70743C19.872 8.84743 19.872 11.8279 17.7975 12.9664L4.4445 20.2984C2.445 21.3949 0 19.9474 0 17.6674V3.00343Z" fill="white"/>
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => skip(-10)}
              className="hover:scale-110 transition-transform cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <path d="M5.53212 21.375C4.64834 21.375 3.94699 21.1561 3.42807 20.7182C2.90915 20.2804 2.64158 19.6885 2.62537 18.9426H4.44969C4.46591 19.2101 4.56726 19.4209 4.75375 19.575C4.94023 19.7209 5.19969 19.7939 5.53212 19.7939C5.88888 19.7939 6.1605 19.7047 6.34699 19.5264C6.54158 19.3399 6.63888 19.0845 6.63888 18.7601V17.8966C6.63888 17.5642 6.54564 17.3128 6.35915 17.1426C6.17266 16.9642 5.89699 16.875 5.53212 16.875C5.3132 16.875 5.12266 16.9074 4.9605 16.9723C4.80645 17.0291 4.68483 17.1182 4.59564 17.2399H2.83212V12.375H8.13483V14.0169H4.6078C4.60334 14.4408 4.58348 16.0927 4.58348 16.3481C4.64191 16.1167 4.79551 15.9058 4.99699 15.7561C5.28888 15.5372 5.68212 15.4277 6.17672 15.4277C6.89834 15.4277 7.4578 15.6466 7.8551 16.0845C8.2605 16.5142 8.46321 17.1182 8.46321 17.8966V18.7601C8.46321 19.5709 8.20375 20.2115 7.68483 20.6818C7.16591 21.1439 6.44834 21.375 5.53212 21.375Z" fill="#CECFD2"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M5.22683 4.46554C9.18089 0.511486 15.5917 0.511486 19.5457 4.46554C23.4998 8.4196 23.4998 14.8304 19.5457 18.7845C17.5689 20.7613 14.9758 21.75 12.3863 21.75H10.8753V19.5H12.3863C14.4034 19.5 16.4168 18.7314 17.9548 17.1935C21.0301 14.1181 21.0301 9.13191 17.9548 6.05653C14.8794 2.98116 9.8932 2.98116 6.81782 6.05653L5.37435 7.5H8.2503V9.75H2.625C2.32663 9.75 2.04048 9.63147 1.8295 9.4205C1.61853 9.20952 1.5 8.92337 1.5 8.625V3H3.75V5.94237L5.22683 4.46554Z" fill="#CECFD2"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => skip(5)}
              className="hover:scale-110 transition-transform cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <path d="M18.6568 21.875C17.773 21.875 17.0716 21.6561 16.5527 21.2182C16.0338 20.7804 15.7662 20.1885 15.75 19.4426H17.5743C17.5905 19.7101 17.6919 19.9209 17.8784 20.075C18.0649 20.2209 18.3243 20.2939 18.6568 20.2939C19.0135 20.2939 19.2851 20.2047 19.4716 20.0264C19.6662 19.8399 19.7635 19.5845 19.7635 19.2601V18.3966C19.7635 18.0642 19.6703 17.8128 19.4838 17.6426C19.2973 17.4642 19.0216 17.375 18.6568 17.375C18.4378 17.375 18.2473 17.4074 18.0851 17.4723C17.9311 17.5291 17.8095 17.6182 17.7203 17.7399H15.9568V12.875H21.2595V14.5169H17.7324C17.728 14.9408 17.7081 16.5927 17.7081 16.8481C17.7665 16.6167 17.9201 16.4058 18.1216 16.2561C18.4135 16.0372 18.8068 15.9277 19.3014 15.9277C20.023 15.9277 20.5824 16.1466 20.9797 16.5845C21.3851 17.0142 21.5878 17.6182 21.5878 18.3966V19.2601C21.5878 20.0709 21.3284 20.7115 20.8095 21.1818C20.2905 21.6439 19.573 21.875 18.6568 21.875Z" fill="#CECFD2"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M15.5584 19.2551H17.7508L17.7615 19.4312C17.7749 19.6521 17.8552 19.8118 17.9959 19.9289C18.1383 20.0395 18.351 20.1064 18.6568 20.1064C18.9839 20.1064 19.2019 20.0249 19.342 19.8909C19.4923 19.7468 19.576 19.5445 19.576 19.2601V18.3966C19.576 18.0993 19.4936 17.9055 19.3574 17.781L19.3541 17.7781C19.2148 17.6448 18.9934 17.5625 18.6568 17.5625C18.4559 17.5625 18.29 17.5923 18.1548 17.6464L18.15 17.6483C18.0273 17.6935 17.937 17.7615 17.8715 17.8507L17.8153 17.9274H15.7693V12.6875H21.447V14.7044H17.9179C17.9168 14.8053 17.9154 14.9275 17.9138 15.0619C17.9099 15.4102 17.905 15.8404 17.9012 16.195C17.9359 16.1634 17.972 16.1337 18.0095 16.1058C18.3436 15.8554 18.7806 15.7402 19.3014 15.7402C20.0625 15.7402 20.6769 15.9726 21.1174 16.4571C21.5641 16.9314 21.7753 17.5868 21.7753 18.3966V19.2601C21.7753 20.1147 21.4998 20.8091 20.9354 21.3207L20.9342 21.3218C20.3712 21.8232 19.604 22.0625 18.6568 22.0625C17.7423 22.0625 16.9936 21.8356 16.4318 21.3615C15.8674 20.8853 15.5798 20.2404 15.5625 19.4466L15.5584 19.2551ZM20.9797 16.5845C20.5824 16.1466 20.023 15.9277 19.3014 15.9277C18.8068 15.9277 18.4135 16.0372 18.1216 16.2561C18.0378 16.3183 17.9623 16.3912 17.8984 16.4717C17.8088 16.5848 17.7422 16.7129 17.7081 16.8481C17.7081 16.7813 17.7095 16.6191 17.7116 16.4084C17.7153 16.0246 17.7216 15.4798 17.7264 15.0572C17.729 14.8241 17.7313 14.6282 17.7324 14.5169H21.2595V12.875H15.9568V17.7399H17.7203C17.8095 17.6182 17.9311 17.5291 18.0851 17.4723C18.2473 17.4074 18.4378 17.375 18.6568 17.375C19.0216 17.375 19.2973 17.4642 19.4838 17.6426M15.9375 19.4426H15.75L15.9375 19.4385C15.9375 19.4399 15.9375 19.4412 15.9375 19.4426ZM15.7596 19.6301H15.75V19.4426C15.7514 19.5062 15.7546 19.5687 15.7596 19.6301ZM20.9797 16.5845C21.3851 17.0142 21.5878 17.6182 21.5878 18.3966L20.9797 16.5845ZM21.5878 19.2601C21.5878 20.0709 21.3284 20.7115 20.8095 21.1818L21.5878 19.2601Z" fill="#CECFD2"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M17.1935 6.55653C14.1181 3.48116 9.13191 3.48116 6.05653 6.55653C2.98116 9.63191 2.98116 14.6181 6.05653 17.6935C7.59444 19.2314 9.60787 20 11.625 20H13.125V22.25H11.625C9.03553 22.25 6.44235 21.2613 4.46554 19.2845C0.511486 15.3304 0.511487 8.9196 4.46554 4.96554C8.4196 1.01149 14.8304 1.01149 18.7845 4.96554L20.2502 6.43128V3.5H22.5002V9.125C22.5002 9.74632 21.9965 10.25 21.3752 10.25H15.7499V8H18.6369L17.1935 6.55653Z" fill="#CECFD2"/>
              </svg>
            </button>

            <div className="flex items-center space-x-2 group/volume">
              <button
                type="button"
                onClick={toggleMute}
                className="hover:scale-110 transition-transform cursor-pointer"
              >
                {(() => {
                  if (isMuted || volume === 0) {
                    return (
                      <svg width="24" height="21" viewBox="0 0 24 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.8495 0.497706C12.1875 -0.645294 14.25 0.307206 14.25 2.06671V18.6267C14.25 20.3877 12.1875 21.3387 10.8495 20.1972L6.5445 16.5267C6.40943 16.4112 6.23773 16.3474 6.06 16.3467H3C2.20435 16.3467 1.44129 16.0306 0.87868 15.468C0.316071 14.9054 0 14.1424 0 13.3467V7.34671C0 6.55106 0.316071 5.78799 0.87868 5.22539C1.44129 4.66278 2.20435 4.34671 3 4.34671H6.06C6.23824 4.34636 6.41054 4.28255 6.546 4.16671L10.8495 0.497706ZM12 2.47171L8.0055 5.87671C7.46286 6.34075 6.7725 6.59605 6.0585 6.59671H3C2.80109 6.59671 2.61032 6.67572 2.46967 6.81638C2.32902 6.95703 2.25 7.14779 2.25 7.34671V13.3467C2.25 13.5456 2.32902 13.7364 2.46967 13.877C2.61032 14.0177 2.80109 14.0967 3 14.0967H6.06C6.77311 14.0969 7.46283 14.3511 8.0055 14.8137L12 18.2202V2.47171ZM21.465 10.3467L23.67 8.14171L22.08 6.55021L19.875 8.75521L17.67 6.55021L16.08 8.14021L18.285 10.3467L16.08 12.5517L17.67 14.1417L19.875 11.9367L22.08 14.1417L23.67 12.5517L21.465 10.3467Z" fill="#CECFD2"/>
                      </svg>
                    )
                  } else if (volume < 0.5) {
                    // Low volume - use new SVG
                    return (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.8495 2.151C12.1875 1.008 14.25 1.9605 14.25 3.72V20.28C14.25 22.041 12.1875 22.992 10.8495 21.8505L6.5445 18.18C6.40943 18.0645 6.23773 18.0007 6.06 18H3C2.20435 18 1.44129 17.6839 0.87868 17.1213C0.316071 16.5587 0 15.7956 0 15V9C0 8.20435 0.316071 7.44128 0.87868 6.87867C1.44129 6.31607 2.20435 6 3 6H6.06C6.23824 5.99965 6.41053 5.93584 6.546 5.82L10.8495 2.151ZM12 6.29143C12 5.43836 11.0005 4.977 10.3513 5.5304L8.0055 7.53C7.46286 7.99404 6.7725 8.24934 6.0585 8.25H3C2.80109 8.25 2.61032 8.32901 2.46967 8.46967C2.32902 8.61032 2.25 8.80108 2.25 9V15C2.25 15.1989 2.32902 15.3897 2.46967 15.5303C2.61032 15.671 2.80109 15.75 3 15.75H6.06C6.7731 15.7502 7.46283 16.0044 8.0055 16.467L10.3511 18.4673C11.0003 19.0209 12 18.5596 12 17.7064V6.29143ZM17.1617 14.9102C16.7714 14.5198 16.7897 13.8898 17.0371 13.3962C17.2525 12.9663 17.3677 12.4883 17.3677 11.9985C17.3677 11.5086 17.2525 11.0307 17.0371 10.6008C16.7897 10.1072 16.7714 9.47714 17.1617 9.08676L17.3375 8.91101C17.7282 8.52032 18.371 8.51655 18.6823 8.97303C19.2861 9.8585 19.6157 10.9115 19.6157 11.9985C19.6157 13.0855 19.2861 14.1385 18.6823 15.024C18.371 15.4804 17.7282 15.4767 17.3375 15.086L17.1617 14.9102Z" fill="#CECFD2"/>
                      </svg>
                    )
                  } else {
                    // High volume - use new SVG
                    return (
                      <svg width="24" height="21" viewBox="0 0 24 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.8495 0.497706C12.1875 -0.645294 14.25 0.307206 14.25 2.06671V18.6267C14.25 20.3877 12.1875 21.3387 10.8495 20.1972L6.5445 16.5267C6.40943 16.4112 6.23773 16.3474 6.06 16.3467H3C2.20435 16.3467 1.44129 16.0306 0.87868 15.468C0.316071 14.9054 0 14.1424 0 13.3467V7.34671C0 6.55106 0.316071 5.78799 0.87868 5.22539C1.44129 4.66278 2.20435 4.34671 3 4.34671H6.06C6.23824 4.34636 6.41053 4.28255 6.546 4.16671L10.8495 0.497706ZM12 4.63814C12 3.78507 11.0005 3.32371 10.3513 3.87711L8.0055 5.87671C7.46286 6.34075 6.7725 6.59605 6.0585 6.59671H3C2.80109 6.59671 2.61032 6.67572 2.46967 6.81638C2.32902 6.95703 2.25 7.14779 2.25 7.34671V13.3467C2.25 13.5456 2.32902 13.7364 2.46967 13.877C2.61032 14.0177 2.80109 14.0967 3 14.0967H6.06C6.7731 14.0969 7.46283 14.3511 8.0055 14.8137L10.3511 16.814C11.0003 17.3677 12 16.9063 12 16.0532V4.63814ZM20.1622 16.2574C19.7716 15.8668 19.778 15.2371 20.1121 14.7973C20.4929 14.2958 20.8088 13.7465 21.0508 13.1622C21.4208 12.2691 21.6112 11.3119 21.6112 10.3452C21.6112 9.37853 21.4208 8.42132 21.0508 7.52824C20.8088 6.94393 20.4929 6.39457 20.1121 5.89311C19.778 5.45329 19.7716 4.82359 20.1622 4.43305L20.3378 4.25738C20.7284 3.86683 21.3663 3.86392 21.7141 4.29296C23.0955 5.99683 23.8592 8.13165 23.8592 10.3452C23.8592 12.5588 23.0955 14.6936 21.7141 16.3975C21.3663 16.8265 20.7284 16.8236 20.3378 16.433L20.1622 16.2574ZM17.1617 13.2569C16.7714 12.8666 16.7897 12.2365 17.0371 11.7429C17.2525 11.313 17.3677 10.8351 17.3677 10.3452C17.3677 9.85535 17.2525 9.37737 17.0371 8.94747C16.7897 8.45389 16.7714 7.82385 17.1617 7.43347L17.3375 7.25772C17.7282 6.86703 18.371 6.86326 18.6823 7.31974C19.2861 8.20521 19.6157 9.25823 19.6157 10.3452C19.6157 11.4322 19.2861 12.4852 18.6823 13.3707C18.371 13.8271 17.7282 13.8234 17.3375 13.4327L17.1617 13.2569Z" fill="#CECFD2"/>
                      </svg>
                    )
                  }
                })()}
              </button>
              <div className="w-0 group-hover/volume:w-20 transition-all duration-300 overflow-hidden">
                <div
                  className="py-2 cursor-pointer"
                  onClick={handleVolumeChange}
                  onMouseDown={handleVolumeMouseDown}
                >
                  <div
                    ref={volumeRef}
                    className="h-1 bg-white/30 rounded-full"
                  >
                    <div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu((prev) => !prev)}
                className="hover:scale-110 transition-transform flex items-center space-x-1 cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                  <g clipPath="url(#clip0_1_8)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M9.087 0.693C9.17229 0.487925 9.31637 0.312683 9.50109 0.189359C9.68581 0.0660356 9.9029 0.000148036 10.125 0L13.875 0C14.0971 0.000148036 14.3142 0.0660356 14.4989 0.189359C14.6836 0.312683 14.8277 0.487925 14.913 0.693L16.452 4.386L20.319 3.825C20.5416 3.79272 20.7688 3.82792 20.9712 3.92605C21.1736 4.02418 21.342 4.18074 21.4545 4.3755L23.3295 7.6245C23.4395 7.81513 23.4912 8.03383 23.4781 8.25352C23.465 8.47322 23.3878 8.68425 23.256 8.8605L20.9055 12L23.256 15.1395C23.526 15.4995 23.556 15.987 23.331 16.377L21.456 19.6245C21.3434 19.8195 21.1748 19.9763 20.9721 20.0744C20.7694 20.1726 20.5418 20.2076 20.319 20.175L16.452 19.614L14.913 23.3085C14.8275 23.5133 14.6833 23.6882 14.4986 23.8113C14.3139 23.9343 14.0969 24 13.875 24H10.125C9.90307 24 9.6861 23.9343 9.5014 23.8113C9.3167 23.6882 9.17252 23.5133 9.087 23.3085L7.548 19.614L3.681 20.175C3.45839 20.2073 3.23121 20.1721 3.0288 20.0739C2.82639 19.9758 2.65804 19.8193 2.5455 19.6245L0.670501 16.377C0.560192 16.1862 0.508353 15.9672 0.521419 15.7472C0.534486 15.5272 0.611883 15.3159 0.744001 15.1395L3.0945 12L0.744001 8.8605C0.611961 8.6844 0.534478 8.47344 0.521147 8.25375C0.507816 8.03405 0.559223 7.81527 0.669001 7.6245L2.544 4.3755C2.65664 4.18047 2.82523 4.02374 3.02794 3.9256C3.23065 3.82745 3.45815 3.79241 3.681 3.825L7.548 4.386L9.087 0.693ZM10.875 2.25L9.5685 5.385C9.2055 6.255 8.301 6.7695 7.368 6.6345L4.113 6.162L2.9895 8.106L4.98 10.764C5.529 11.496 5.529 12.504 4.98 13.236L2.9895 15.894L4.113 17.838L7.368 17.3655C7.8213 17.2996 8.28362 17.3865 8.68206 17.6125C9.08049 17.8385 9.39237 18.1907 9.5685 18.6135L10.875 21.75H13.125L14.4315 18.615C14.7945 17.745 15.699 17.2305 16.632 17.3655L19.887 17.838L21.0105 15.894L19.02 13.236C18.753 12.8793 18.6086 12.4456 18.6086 12C18.6086 11.5544 18.753 11.1207 19.02 10.764L21.0105 8.106L19.887 6.162L16.632 6.6345C16.1783 6.70061 15.7155 6.61366 15.3167 6.38738C14.9179 6.1611 14.6059 5.8084 14.43 5.385L13.125 2.25H10.875ZM12 9.75C11.4033 9.75 10.831 9.98705 10.409 10.409C9.98705 10.831 9.75 11.4033 9.75 12C9.75 12.5967 9.98705 13.169 10.409 13.591C10.831 14.0129 11.4033 14.25 12 14.25C12.5967 14.25 13.169 14.0129 13.591 13.591C14.0129 13.169 14.25 12.5967 14.25 12C14.25 11.4033 14.0129 10.831 13.591 10.409C13.169 9.98705 12.5967 9.75 12 9.75ZM7.5 12C7.5 10.8065 7.97411 9.66193 8.81802 8.81802C9.66193 7.97411 10.8065 7.5 12 7.5C13.1935 7.5 14.3381 7.97411 15.182 8.81802C16.0259 9.66193 16.5 10.8065 16.5 12C16.5 13.1935 16.0259 14.3381 15.182 15.182C14.3381 16.0259 13.1935 16.5 12 16.5C10.8065 16.5 9.66193 16.0259 8.81802 15.182C7.97411 14.3381 7.5 13.1935 7.5 12Z" fill="#CECFD2"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_1_8">
                      <rect width="24" height="24" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                <span className="text-sm font-medium">{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg py-2 shadow-xl">
                  <div className="flex items-center px-3 pb-2 mb-2 border-b border-gray-700">
                    <ChevronUp className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-xs text-gray-400">Speed</span>
                  </div>
                  {SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => handleSpeedChange(speed)}
                      className={cn(
                        'block w-full px-4 py-1.5 text-left text-sm transition-colors',
                        playbackSpeed === speed
                          ? 'bg-red-500 text-white'
                          : 'text-white hover:bg-gray-800',
                      )}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="hover:scale-110 transition-transform cursor-pointer"
            >
              {isFullscreen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                  <path fillRule="evenodd" clipRule="evenodd" d="M19.5 3.75H15V1.5H19.5C20.2956 1.5 21.0587 1.81607 21.6213 2.37868C22.1839 2.94129 22.5 3.70435 22.5 4.5V9H20.25V4.5C20.25 4.30109 20.171 4.11032 20.0303 3.96967C19.8897 3.82902 19.6989 3.75 19.5 3.75ZM4.5 3.75C4.30109 3.75 4.11032 3.82902 3.96967 3.96967C3.82902 4.11032 3.75 4.30109 3.75 4.5V9H1.5V4.5C1.5 3.70435 1.81607 2.94129 2.37868 2.37868C2.94129 1.81607 3.70435 1.5 4.5 1.5H9V3.75H4.5ZM3.75 15V19.5C3.75 19.6989 3.82902 19.8897 3.96967 20.0303C4.11032 20.171 4.30109 20.25 4.5 20.25H9V22.5H4.5C3.70435 22.5 2.94129 22.1839 2.37868 21.6213C1.81607 21.0587 1.5 20.2956 1.5 19.5V15H3.75ZM20.25 19.5V15H22.5V19.5C22.5 20.2956 22.1839 21.0587 21.6213 21.6213C21.0587 22.1839 20.2956 22.5 19.5 22.5H15V20.25H19.5C19.6989 20.25 19.8897 20.171 20.0303 20.0303C20.171 19.8897 20.25 19.6989 20.25 19.5Z" fill="#CECFD2"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                  <path fillRule="evenodd" clipRule="evenodd" d="M19.5 3.75H15V1.5H19.5C20.2956 1.5 21.0587 1.81607 21.6213 2.37868C22.1839 2.94129 22.5 3.70435 22.5 4.5V9H20.25V4.5C20.25 4.30109 20.171 4.11032 20.0303 3.96967C19.8897 3.82902 19.6989 3.75 19.5 3.75ZM4.5 3.75C4.30109 3.75 4.11032 3.82902 3.96967 3.96967C3.82902 4.11032 3.75 4.30109 3.75 4.5V9H1.5V4.5C1.5 3.70435 1.81607 2.94129 2.37868 2.37868C2.94129 1.81607 3.70435 1.5 4.5 1.5H9V3.75H4.5ZM3.75 15V19.5C3.75 19.6989 3.82902 19.8897 3.96967 20.0303C4.11032 20.171 4.30109 20.25 4.5 20.25H9V22.5H4.5C3.70435 22.5 2.94129 22.1839 2.37868 21.6213C1.81607 21.0587 1.5 20.2956 1.5 19.5V15H3.75ZM20.25 19.5V15H22.5V19.5C22.5 20.2956 22.1839 21.0587 21.6213 21.6213C21.0587 22.1839 20.2956 22.5 19.5 22.5H15V20.25H19.5C19.6989 20.25 19.8897 20.171 20.0303 20.0303C20.171 19.8897 20.25 19.6989 20.25 19.5Z" fill="#CECFD2"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
