"use client"

import { memo, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { preloadRoute } from '@/lib/performance'
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Play, Calendar } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string | null
  base_video_url: string | null
  created_at: string
}

interface ProjectCardProps {
  project: Project
}

const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Enhanced preloading with intelligent priority
  const handleMouseEnter = () => {
    preloadRoute(`/projects/${project.id}`, 'high')
  }

  // Generate thumbnail from video
  const generateThumbnail = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (video && canvas && video.videoWidth > 0) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
        setThumbnailUrl(thumbnail)
        setVideoLoaded(true)
      }
    }
  }

  // Load video and generate thumbnail
  useEffect(() => {
    if (project.base_video_url && videoRef.current && !videoLoaded) {
      const video = videoRef.current

      const onLoadedData = () => {
        video.currentTime = 1 // Seek to 1 second
      }

      const onSeeked = () => {
        setTimeout(() => generateThumbnail(), 100) // Small delay to ensure frame is rendered
      }

      video.addEventListener('loadeddata', onLoadedData)
      video.addEventListener('seeked', onSeeked)

      return () => {
        video.removeEventListener('loadeddata', onLoadedData)
        video.removeEventListener('seeked', onSeeked)
      }
    }
  }, [project.base_video_url, videoLoaded])

  return (
    <Card
      className="max-w-[320px] hover:scale-105 transition-transform duration-200 border-2 border-gray-200 dark:border-gray-800 shadow-lg rounded-2xl"
      onMouseEnter={handleMouseEnter}
    >
      {/* Video Thumbnail */}
      {project.base_video_url ? (
        <CardHeader className="p-0">
          <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">

            {/* Hidden video element for thumbnail generation */}
            <video
              ref={videoRef}
              className="hidden"
              preload="metadata"
              muted
              crossOrigin="anonymous"
            >
              <source src={project.base_video_url} type="video/mp4" />
            </video>

            {/* Hidden canvas for thumbnail generation */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Thumbnail display */}
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={`${project.name} thumbnail`}
                className="w-full h-full object-cover"
              />
            ) : (
              /* Fallback content when video is loading */
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2 animate-pulse">🎬</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading Preview...</div>
                </div>
              </div>
            )}

            {/* Play button overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
              <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full p-3 border-2 border-white/50">
                <Play className="h-6 w-6 text-gray-800 dark:text-white" fill="currentColor" />
              </div>
            </div>
          </div>
        </CardHeader>
      ) : (
        <CardHeader className="p-0">
          <div className="relative w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
            <div className="text-center">
              <div className="text-6xl mb-2">📹</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">No Video Yet</div>
            </div>
            <div className="absolute top-2 right-2">
              <Chip size="sm" color="warning" variant="flat">
                Setup needed
              </Chip>
            </div>
          </div>
        </CardHeader>
      )}

      <CardBody className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold truncate text-gray-900 dark:text-gray-100">
            {project.name}
          </h3>
          {project.base_video_url && (
            <Chip size="sm" color="success" variant="flat">
              Ready
            </Chip>
          )}
        </div>

        {project.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {project.description}
          </p>
        )}
      </CardBody>

      <CardFooter className="p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="h-4 w-4 mr-1" />
          {new Date(project.created_at).toLocaleDateString()}
        </div>

        <Link href={`/projects/${project.id}`}>
          <Button size="sm" color="primary" variant="solid" className="font-medium">
            View Project
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
})

export { ProjectCard }