'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Play,
  ExternalLink,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

export interface VideoResult {
  prospectId: string
  prospectName: string
  website: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  videoUrl?: string
  error?: string
  generatedAt?: string
}

export interface VideoResultsSummary {
  total: number
  pending: number
  processing: number
  completed: number
  failed: number
}

interface VideoPersonalizationResultsProps {
  projectId: string
  results: VideoResult[]
  summary: VideoResultsSummary
  isProcessing: boolean
  onRefresh: () => Promise<void>
  onRetryFailed: (prospectIds: string[]) => Promise<void>
}

export function VideoPersonalizationResults({
  projectId,
  results,
  summary,
  isProcessing,
  onRefresh,
  onRetryFailed
}: VideoPersonalizationResultsProps) {
  const [selectedResults, setSelectedResults] = useState<string[]>([])

  const handleSelectAll = (status?: VideoResult['status']) => {
    if (status) {
      const filtered = results.filter(r => r.status === status).map(r => r.prospectId)
      setSelectedResults(filtered)
    } else {
      setSelectedResults(results.map(r => r.prospectId))
    }
  }

  const handleSelectResult = (prospectId: string) => {
    setSelectedResults(prev =>
      prev.includes(prospectId)
        ? prev.filter(id => id !== prospectId)
        : [...prev, prospectId]
    )
  }

  const handleRetrySelected = async () => {
    const failedSelected = selectedResults.filter(id =>
      results.find(r => r.prospectId === id)?.status === 'failed'
    )
    if (failedSelected.length > 0) {
      await onRetryFailed(failedSelected)
      setSelectedResults([])
    }
  }

  const failedResults = results.filter(r => r.status === 'failed')
  const completedResults = results.filter(r => r.status === 'completed')

  const getStatusIcon = (status: VideoResult['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: VideoResult['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{summary.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{summary.processing}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{summary.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-gray-600">{summary.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {summary.total > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round((summary.completed / summary.total) * 100)}% Complete</span>
              </div>
              <Progress value={(summary.completed / summary.total) * 100} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={onRefresh} variant="outline" disabled={isProcessing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>

        {failedResults.length > 0 && (
          <Button
            onClick={() => handleSelectAll('failed')}
            variant="outline"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Select All Failed ({failedResults.length})
          </Button>
        )}

        {selectedResults.length > 0 && failedResults.some(r => selectedResults.includes(r.prospectId)) && (
          <Button
            onClick={handleRetrySelected}
            disabled={isProcessing}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Selected ({selectedResults.filter(id => failedResults.find(r => r.prospectId === id)).length})
          </Button>
        )}

        {completedResults.length > 0 && (
          <Button
            onClick={() => handleSelectAll('completed')}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Select All Completed ({completedResults.length})
          </Button>
        )}
      </div>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle>Video Generation Results</CardTitle>
          <CardDescription>
            Detailed status for each prospect in your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No video generation results yet. Start by generating preview videos or processing all prospects.
              </div>
            ) : (
              results.map((result) => (
                <div
                  key={result.prospectId}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    selectedResults.includes(result.prospectId) ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedResults.includes(result.prospectId)}
                      onChange={() => handleSelectResult(result.prospectId)}
                      className="rounded"
                    />

                    {getStatusIcon(result.status)}

                    <div>
                      <div className="font-medium">{result.prospectName}</div>
                      <div className="text-sm text-muted-foreground">
                        {result.website}
                      </div>
                      {result.error && (
                        <div className="text-sm text-red-600 mt-1">
                          Error: {result.error}
                        </div>
                      )}
                      {result.generatedAt && (
                        <div className="text-xs text-muted-foreground">
                          Generated: {new Date(result.generatedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(result.status)}

                    {result.status === 'completed' && result.videoUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(result.videoUrl, '_blank')}
                      >
                        <Play className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    )}

                    {result.website && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(result.website.startsWith('http') ? result.website : `https://${result.website}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}