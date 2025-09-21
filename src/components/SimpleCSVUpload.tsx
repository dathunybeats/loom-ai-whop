'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Plus } from 'lucide-react'

interface CSVUploadProps {
  projectId: string
  onUploadSuccess: (count: number) => void
  onClose: () => void
}

interface ParsedProspect {
  first_name: string
  last_name?: string
  email: string
  website_url: string
  company?: string
}

export function SimpleCSVUpload({ projectId, onUploadSuccess, onClose }: CSVUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ParsedProspect[]>([])
  const [previewMode, setPreviewMode] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualWebsite, setManualWebsite] = useState('')

  const parseCSV = useCallback((csvText: string): ParsedProspect[] => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row')
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
    const prospects: ParsedProspect[] = []

    // Simple column mapping for website-focused CSV
    const columnMap = {
      first_name: ['first_name', 'firstname', 'fname', 'name', 'first'],
      last_name: ['last_name', 'lastname', 'lname', 'last'],
      email: ['email', 'email_address', 'e_mail'],
      website_url: ['website', 'website_url', 'url', 'domain', 'site'],
      company: ['company', 'company_name', 'organization', 'business']
    }

    // Find column indices
    const findColumnIndex = (possibleNames: string[]) => {
      return headers.findIndex(header =>
        possibleNames.some(name => header.includes(name))
      )
    }

    const indices = {
      first_name: findColumnIndex(columnMap.first_name),
      last_name: findColumnIndex(columnMap.last_name),
      email: findColumnIndex(columnMap.email),
      website_url: findColumnIndex(columnMap.website_url),
      company: findColumnIndex(columnMap.company)
    }

    // Validate required columns
    if (indices.first_name === -1) {
      throw new Error('Required column "first_name" not found. Try: first_name, firstname, fname, name')
    }
    if (indices.email === -1) {
      throw new Error('Required column "email" not found. Try: email, email_address')
    }
    if (indices.website_url === -1) {
      throw new Error('Required column "website" not found. Try: website, website_url, url, domain')
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))

      if (values.length < headers.length) continue // Skip incomplete rows

      const prospect: ParsedProspect = {
        first_name: values[indices.first_name]?.trim() || '',
        email: values[indices.email]?.trim() || '',
        website_url: values[indices.website_url]?.trim() || '',
      }

      // Add optional fields
      if (indices.last_name !== -1) {
        prospect.last_name = values[indices.last_name]?.trim() || ''
      }
      if (indices.company !== -1) {
        prospect.company = values[indices.company]?.trim() || ''
      }

      // Validate required fields
      if (!prospect.first_name || !prospect.email || !prospect.website_url) {
        continue // Skip invalid rows
      }

      // Basic email validation
      if (!/\S+@\S+\.\S+/.test(prospect.email)) {
        continue // Skip invalid emails
      }

      prospects.push(prospect)
    }

    if (prospects.length === 0) {
      throw new Error('No valid prospects found in CSV. Check your data format.')
    }

    return prospects
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setError(null)
    setIsUploading(true)
    setUploadProgress(10)

    try {
      // Read file
      const text = await file.text()
      setUploadProgress(30)

      // Parse CSV
      const prospects = parseCSV(text)
      setUploadProgress(50)

      // Show preview
      setParsedData(prospects)
      setPreviewMode(true)
      setUploadProgress(100)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV')
    } finally {
      setIsUploading(false)
    }
  }, [parseCSV])

  const uploadProspects = async () => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Upload in batches
      const batchSize = 10
      for (let i = 0; i < parsedData.length; i += batchSize) {
        const batch = parsedData.slice(i, i + batchSize)

        const response = await fetch('/api/prospects/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            prospects: batch
          })
        })

        if (!response.ok) {
          throw new Error('Failed to upload prospects')
        }

        setUploadProgress(((i + batch.length) / parsedData.length) * 100)
      }

      onUploadSuccess(parsedData.length)
      onClose()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload prospects')
    } finally {
      setIsUploading(false)
    }
  }

  const addManualWebsite = async () => {
    if (!manualWebsite.trim()) {
      setError('Please enter a website URL')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Create a prospect with just the website
      const prospect = {
        first_name: 'Website Visitor',
        email: `contact@${manualWebsite.replace(/^https?:\/\//, '').replace(/^www\./, '')}`,
        website_url: manualWebsite.trim(),
      }

      const response = await fetch('/api/prospects/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          prospects: [prospect]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add website')
      }

      onUploadSuccess(1)
      setManualWebsite('')
      onClose()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add website')
    } finally {
      setIsUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: isUploading
  })

  if (previewMode) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            CSV Preview
          </CardTitle>
          <CardDescription>
            Found {parsedData.length} valid prospects. Review and confirm upload.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Preview table */}
            <div className="max-h-60 overflow-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Website</th>
                    <th className="p-2 text-left">Company</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((prospect, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{prospect.first_name} {prospect.last_name}</td>
                      <td className="p-2">{prospect.email}</td>
                      <td className="p-2">{prospect.website_url}</td>
                      <td className="p-2">{prospect.company || '-'}</td>
                    </tr>
                  ))}
                  {parsedData.length > 5 && (
                    <tr className="border-t">
                      <td colSpan={4} className="p-2 text-center text-muted-foreground">
                        ... and {parsedData.length - 5} more prospects
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground">
                  Uploading prospects... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                Back to Upload
              </Button>
              <Button onClick={uploadProspects} isLoading={isUploading}>
                Upload {parsedData.length} Prospects
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showManualEntry) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Website Manually
          </CardTitle>
          <CardDescription>
            Enter a website URL to create a video for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="website" className="text-sm font-medium">
                Website URL
              </label>
              <input
                id="website"
                type="url"
                placeholder="e.g., company.com or https://company.com"
                value={manualWebsite}
                onChange={(e) => setManualWebsite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isUploading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowManualEntry(false)}>
                Back
              </Button>
              <Button onClick={addManualWebsite} isLoading={isUploading}>
                Add Website
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop your CSV file here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drop your CSV file here or click to browse</p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV files up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Manual Entry Button */}
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setShowManualEntry(true)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Website Manually
            </Button>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground">
                Processing... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}