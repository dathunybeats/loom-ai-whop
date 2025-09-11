'use client'

import { useState } from 'react'
import VideoUpload from './VideoUpload'
import VideoPlayer from './VideoPlayer'

interface VideoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  currentVideoUrl?: string
  onUploadSuccess: (videoUrl: string) => void
}

export default function VideoUploadModal({ 
  isOpen, 
  onClose, 
  projectId, 
  currentVideoUrl,
  onUploadSuccess 
}: VideoUploadModalProps) {
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isOpen) return null

  const handleUploadComplete = (videoUrl: string) => {
    setUploadedVideoUrl(videoUrl)
    setSuccess('Video uploaded successfully!')
    setError('')
    onUploadSuccess(videoUrl)
    
    // Auto-close modal after 2 seconds
    setTimeout(() => {
      onClose()
      setSuccess('')
    }, 2000)
  }

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage)
    setSuccess('')
  }

  const handleClose = () => {
    setError('')
    setSuccess('')
    setUploadedVideoUrl(null)
    onClose()
  }

  const videoToShow = uploadedVideoUrl || currentVideoUrl

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentVideoUrl ? 'Replace Base Video' : 'Upload Base Video'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Current video preview */}
          {videoToShow && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                {uploadedVideoUrl ? 'Newly Uploaded Video' : 'Current Video'}
              </h3>
              <VideoPlayer videoUrl={videoToShow} className="w-full" />
              
              {!uploadedVideoUrl && (
                <p className="text-sm text-gray-600 text-center">
                  Upload a new video to replace this one
                </p>
              )}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Upload component (hide if upload is successful) */}
          {!uploadedVideoUrl && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                {videoToShow ? 'Upload New Video' : 'Upload Your Base Video'}
              </h3>
              <VideoUpload
                projectId={projectId}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              📝 Video Requirements:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Include "[FIRST_NAME]" where you want prospect names to appear</li>
              <li>• Supported formats: MP4, WebM, MOV, AVI, QuickTime</li>
              <li>• Maximum file size: 1GB</li>
              <li>• Recommended: Clear audio and good lighting</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {uploadedVideoUrl ? 'Done' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}