'use client'

import { useState, useRef } from 'react'

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
      handleFileUpload(files[0]).catch(err => {
        console.error('Upload failed:', err)
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0]).catch(err => {
        console.error('Upload failed:', err)
      })
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

    let progressInterval: NodeJS.Timeout | null = null

    try {
      console.log('🚀 Starting upload via API route...')
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      // Start progress simulation
      setUploadProgress(5)
      let currentProgress = 5
      
      progressInterval = setInterval(() => {
        if (currentProgress < 90) {
          const increment = Math.random() * 8 + 2 // 2-10% increments
          currentProgress = Math.min(currentProgress + increment, 90)
          setUploadProgress(currentProgress)
        }
      }, 1000)

      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData
      })

      // Clear progress interval
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      // Complete the progress
      setUploadProgress(95)
      setTimeout(() => setUploadProgress(100), 200)

      // Reset state after successful upload
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
        onUploadComplete(result.videoUrl)
      }, 1500)

    } catch (error: any) {
      console.error('💥 Upload error:', error)

      // Clear progress interval on error
      if (progressInterval) {
        clearInterval(progressInterval)
      }

      // Provide specific error messages
      let errorMessage = 'Failed to upload video'
      if (error.message?.includes('row-level security') || error.message?.includes('permission')) {
        errorMessage = 'Upload permission denied. Please refresh the page and try again.'
      } else if (error.message?.includes('storage') || error.message?.includes('bucket')) {
        errorMessage = 'Storage upload failed. Please check your internet connection and try again.'
      } else if (error.message?.includes('size') || error.message?.includes('too large')) {
        errorMessage = 'File too large. Please use a video file smaller than 1GB.'
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Upload timed out. Please check your internet connection and try again.'
      } else if (error.message?.includes('Authentication') || error.message?.includes('session')) {
        errorMessage = 'Authentication expired. Please refresh the page and try again.'
      } else if (error.message?.includes('Project not found')) {
        errorMessage = 'Project not found. Please refresh the page and try again.'
      } else if (error.message) {
        errorMessage = error.message
      }

      // Reset state on error
      setUploading(false)
      setUploadProgress(0)
      onUploadError(errorMessage)
    } finally {
      // Ensure progress interval is always cleared
      if (progressInterval) {
        clearInterval(progressInterval)
      }
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
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{Math.round(uploadProgress)}% complete</p>
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