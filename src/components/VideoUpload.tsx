'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface VideoUploadProps {
  projectId: string
  onUploadComplete: (videoUrl: string) => void
  onUploadError: (error: string) => void
}

export default function VideoUpload({ projectId, onUploadComplete, onUploadError }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      onUploadError('Please upload a valid video file (MP4, WebM, MOV, AVI, QuickTime)')
      return
    }

    // Validate file size (1GB limit)
    const maxSize = 1024 * 1024 * 1024 // 1GB in bytes
    if (file.size > maxSize) {
      onUploadError('File size must be less than 1GB')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to upload videos')
      }

      // Create file path: user-id/project-id/filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${projectId}/base-video.${fileExt}`

      // Upload file to Supabase Storage with optimizations
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '31536000', // 1 year cache for better performance
          upsert: true, // Replace existing file if it exists
          duplex: 'half' as any // Enable streaming upload for large files
        })

      if (error) {
        throw error
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName)

      // Update the project with the video URL
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          base_video_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', user.id)

      if (updateError) {
        throw updateError
      }

      setUploadProgress(100)
      onUploadComplete(publicUrl)
    } catch (error: any) {
      console.error('Upload error:', error)
      onUploadError(error.message || 'Failed to upload video')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="video/mp4,video/webm,video/mov,video/avi,video/quicktime"
          onChange={handleFileSelect}
        />

        <div className="text-center">
          {uploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Uploading video...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                stroke="currentColor" 
                fill="none" 
                viewBox="0 0 48 48"
              >
                <path 
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                  strokeWidth={2} 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Drop your video here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports MP4, WebM, MOV, AVI, QuickTime (up to 1GB)
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tip:</strong> Include "[FIRST_NAME]" in your video where you want the prospect's name to appear
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}