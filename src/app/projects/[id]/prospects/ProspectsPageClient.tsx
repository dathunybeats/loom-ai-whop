'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProspectsDataTable, type Prospect } from '@/components/ProspectsDataTable'
import { SimpleCSVUpload } from '@/components/SimpleCSVUpload'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Plus, Upload, Video, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Project = Database['public']['Tables']['projects']['Row']
type User = {
  id: string
  email?: string
}

interface ProspectsPageClientProps {
  project: Project
  initialProspects: Prospect[]
  user: User
}

export default function ProspectsPageClient({
  project,
  initialProspects,
  user
}: ProspectsPageClientProps) {
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects)
  const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false)
  const [processingStatus, setProcessingStatus] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showProgress, setShowProgress] = useState(false)

  // Check processing status and update prospects
  useEffect(() => {
    const checkStatus = () => {
      const pendingCount = prospects.filter(p => p.video_status === 'pending').length
      const processingCount = prospects.filter(p => p.video_status === 'processing').length
      const completedCount = prospects.filter(p => p.video_status === 'completed').length
      const failedCount = prospects.filter(p => p.video_status === 'failed').length

      const status = {
        total: prospects.length,
        pending: pendingCount,
        processing: processingCount,
        completed: completedCount,
        failed: failedCount
      }

      setProcessingStatus(status)

      // Show progress if there are pending or processing videos
      const hasActiveProcessing = pendingCount > 0 || processingCount > 0
      setIsProcessing(hasActiveProcessing)
      setShowProgress(hasActiveProcessing)
    }

    checkStatus()
  }, [prospects])

  // Poll for updates when processing
  useEffect(() => {
    if (!isProcessing) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/personalize-video?projectId=${project.id}`)
        const result = await response.json()

        if (result.success && result.prospects) {
          setProspects(result.prospects)
        }
      } catch (error) {
        console.error('Error polling for updates:', error)
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [isProcessing, project.id])

  // Handle CSV upload success
  const handleCSVUploadSuccess = async (count: number) => {
    // Refresh prospects list
    const supabase = createClient()
    const { data: newProspects, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('project_id', project.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (newProspects && !error) {
      setProspects(newProspects)
    }
  }

  // Handle adding individual prospect
  const handleAddProspect = async (prospect: Omit<Prospect, 'id' | 'created_at' | 'video_status'>) => {
    const response = await fetch('/api/prospects/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id,
        prospects: [prospect]
      })
    })

    if (!response.ok) {
      throw new Error('Failed to add prospect')
    }

    // Refresh prospects list
    const supabase = createClient()
    const { data: newProspects, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('project_id', project.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (newProspects && !error) {
      setProspects(newProspects)
    }
  }

  // Handle bulk delete
  const handleDeleteSelected = async (ids: string[]) => {
    const response = await fetch(`/api/prospects/bulk?ids=${ids.join(',')}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Failed to delete prospects')
    }

    // Refresh prospects list
    const supabase = createClient()
    const { data: newProspects, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('project_id', project.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (newProspects && !error) {
      setProspects(newProspects)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Link href={`/projects/${project.id}`} className="text-primary hover:text-primary/80 text-sm">
              ← Back to Project
            </Link>
            <h1 className="text-3xl font-bold text-foreground mt-2">
              Prospects - {project.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {prospects.length} total prospects
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsCSVUploadOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload CSV
            </Button>
          </div>
        </div>

        {/* Video Processing Progress */}
        {showProgress && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Video Processing in Progress</h3>
                </div>
                {isProcessing && (
                  <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {processingStatus.completed} of {processingStatus.total} completed
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="w-full">
                <Progress
                  value={processingStatus.total > 0 ? (processingStatus.completed / processingStatus.total) * 100 : 0}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{Math.round(processingStatus.total > 0 ? (processingStatus.completed / processingStatus.total) * 100 : 0)}% complete</span>
                  <span>Estimated time: {Math.max(1, Math.ceil((processingStatus.pending + processingStatus.processing) * 0.5))} minutes</span>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-2xl font-bold text-yellow-600">{processingStatus.pending}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Pending</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-1">
                    <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                    <span className="text-2xl font-bold text-blue-600">{processingStatus.processing}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Processing</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">{processingStatus.completed}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Completed</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-1">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-2xl font-bold text-red-600">{processingStatus.failed}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Failed</span>
                </div>
              </div>

              {isProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    🚀 <strong>Processing videos with AWS Lambda...</strong> Your personalized videos are being generated in the background.
                    You can leave this page and come back later - the processing will continue automatically.
                  </p>
                </div>
              )}

              {!isProcessing && processingStatus.completed > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    🎉 <strong>All videos processed!</strong> Your personalized videos are ready.
                    You can now view, download, or share them with your prospects.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-card border border-border rounded-lg p-6">
          <ProspectsDataTable
            data={prospects}
            onAddProspect={handleAddProspect}
            onDeleteSelected={handleDeleteSelected}
          />
        </div>
      </div>

      {/* CSV Upload Modal */}
      <Dialog open={isCSVUploadOpen} onOpenChange={setIsCSVUploadOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Prospects</DialogTitle>
          </DialogHeader>
          <SimpleCSVUpload
            projectId={project.id}
            onUploadSuccess={handleCSVUploadSuccess}
            onClose={() => setIsCSVUploadOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}