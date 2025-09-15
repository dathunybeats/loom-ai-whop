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

    console.log('📁 File dropped')
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      console.log('📁 File found, calling handleFileUpload')
      handleFileUpload(files[0]).catch(err => {
        console.error('💥 handleFileUpload failed:', err)
      })
    } else {
      console.log('❌ No files dropped')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📂 File selected from input')
    const files = e.target.files
    if (files && files.length > 0) {
      console.log('📂 File found, calling handleFileUpload')
      handleFileUpload(files[0]).catch(err => {
        console.error('💥 handleFileUpload failed:', err)
      })
    } else {
      console.log('❌ No files selected')
    }
  }

  const handleFileUpload = async (file: File) => {
    console.log('🎬 Starting video upload:', file.name, file.size, file.type)

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Invalid file type:', file.type)
      onUploadError('Please upload a valid video file (MP4, WebM, MOV, AVI, QuickTime)')
      return
    }

    // Validate file size (1GB limit)
    const maxSize = 1024 * 1024 * 1024 // 1GB in bytes
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size)
      onUploadError('File size must be less than 1GB')
      return
    }

    console.log('✅ File validation passed, starting upload...')
    setUploading(true)
    setUploadProgress(0)

    let progressInterval: NodeJS.Timeout | null = null

    try {
      console.log('🔄 Creating Supabase client...')
      const supabase = createClient()

      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('❌ Authentication error:', authError)
        onUploadError('Please log in to upload videos')
        return
      }

      console.log('✅ User authenticated:', user.id)

      // Start progress simulation - more reliable approach
      setUploadProgress(10)
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) return prev // Stop at 85% until upload completes
          const increment = Math.random() * 5 + 5 // 5-10% increments
          const newValue = Math.min(prev + increment, 85)
          console.log('Progress update:', newValue)
          return newValue
        })
      }, 800)

      // Create file path: user-id/project-id/filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${projectId}/base-video.${fileExt}`

      console.log('🚀 Starting upload for file:', fileName, 'Size:', file.size, 'Type:', file.type)

      // Upload file to Supabase Storage with timeout
      console.log('⬆️ Starting storage upload...')
      const uploadPromise = supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '31536000', // 1 year cache for better performance
          upsert: true // Replace existing file if it exists
        })

      const uploadTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Storage upload timeout after 5 minutes')), 300000)
      )

      const { data, error } = await Promise.race([uploadPromise, uploadTimeoutPromise]) as any

      // Clear progress interval
      if (progressInterval) clearInterval(progressInterval)

      if (error) {
        console.error('Supabase upload error:', error)
        throw error
      }

      console.log('✅ Upload successful:', data)
      setUploadProgress(90)

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName)

      console.log('📄 Generated public URL:', publicUrl)
      setUploadProgress(95)

      // Update the project with the video URL
      console.log('🔄 Updating project database...')
      const { data: updateData, error: updateError } = await supabase
        .from('projects')
        .update({
          base_video_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()

      console.log('📊 Update result:', { updateData, updateError })

      if (updateError) {
        console.error('❌ Database update error:', updateError)
        throw updateError
      }

      if (!updateData || updateData.length === 0) {
        console.error('❌ No rows updated - check project ownership')
        throw new Error('Project not found or access denied')
      }

      console.log('✅ Project updated successfully:', updateData)
      setUploadProgress(100)

      // Reset state after successful upload
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
        onUploadComplete(publicUrl)
      }, 1000)

    } catch (error: any) {
      console.error('❌ Upload error:', error)

      // Clear progress interval on error
      if (progressInterval) clearInterval(progressInterval)

      // Provide more specific error messages
      let errorMessage = 'Failed to upload video'
      if (error.message?.includes('row-level security')) {
        errorMessage = 'Upload permission denied. Please check your account permissions.'
      } else if (error.message?.includes('storage')) {
        errorMessage = 'Storage upload failed. Please try again.'
      } else if (error.message?.includes('size')) {
        errorMessage = 'File too large. Please use a smaller video file.'
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
      setUploading(false)
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