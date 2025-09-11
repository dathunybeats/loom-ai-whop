'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CSVUploadProps {
  projectId: string
  onUploadComplete: (uploadId: string, prospectCount: number) => void
  onUploadError: (error: string) => void
}

interface ParsedCSVRow {
  first_name: string
  last_name?: string
  email: string
  company?: string
  title?: string
  phone?: string
  [key: string]: string | undefined // For additional columns
}

interface ParseResult {
  data: ParsedCSVRow[]
  errors: { row: number; message: string; data?: any }[]
  totalRows: number
  validRows: number
}

// Required columns for prospects
const REQUIRED_COLUMNS = ['first_name', 'email']

// Optional columns that map to database fields
const OPTIONAL_COLUMNS = ['last_name', 'company', 'title', 'phone']

// Common column name variations and their mappings
const COLUMN_MAPPINGS: { [key: string]: string } = {
  // First name variations
  'firstname': 'first_name',
  'fname': 'first_name',
  'given_name': 'first_name',
  'first': 'first_name',
  
  // Last name variations
  'lastname': 'last_name',
  'lname': 'last_name',
  'surname': 'last_name',
  'family_name': 'last_name',
  'last': 'last_name',
  
  // Email variations
  'email_address': 'email',
  'e_mail': 'email',
  'mail': 'email',
  
  // Company variations
  'company_name': 'company',
  'organization': 'company',
  'employer': 'company',
  'business': 'company',
  
  // Title variations
  'job_title': 'title',
  'position': 'title',
  'role': 'title',
  
  // Phone variations
  'phone_number': 'phone',
  'telephone': 'phone',
  'mobile': 'phone',
  'cell': 'phone'
}

export default function CSVUpload({ projectId, onUploadComplete, onUploadError }: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }, [])

  const normalizeColumnName = (columnName: string): string => {
    const normalized = columnName.toLowerCase().trim().replace(/\s+/g, '_')
    return COLUMN_MAPPINGS[normalized] || normalized
  }

  const parseCSVContent = (content: string): ParseResult => {
    const lines = content.trim().split('\n')
    if (lines.length === 0) {
      throw new Error('CSV file is empty')
    }

    // Parse header
    const headerLine = lines[0]
    const headers = headerLine.split(',').map(h => normalizeColumnName(h.replace(/"/g, '').trim()))
    
    // Check for required columns
    const missingRequired = REQUIRED_COLUMNS.filter(col => !headers.includes(col))
    if (missingRequired.length > 0) {
      throw new Error(`Missing required columns: ${missingRequired.join(', ')}. Found: ${headers.join(', ')}`)
    }

    const data: ParsedCSVRow[] = []
    const errors: { row: number; message: string; data?: any }[] = []

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue // Skip empty lines

      try {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim())
        
        if (values.length !== headers.length) {
          errors.push({
            row: i + 1,
            message: `Column count mismatch. Expected ${headers.length}, got ${values.length}`,
            data: { line, values }
          })
          continue
        }

        const rowData: ParsedCSVRow = {
          first_name: '',
          email: ''
        }

        // Map values to columns
        headers.forEach((header, index) => {
          const value = values[index]
          if (REQUIRED_COLUMNS.includes(header) || OPTIONAL_COLUMNS.includes(header)) {
            (rowData as any)[header] = value
          } else {
            // Store additional columns in a custom fields object
            if (!rowData.custom_fields) {
              (rowData as any).custom_fields = {}
            }
            ;(rowData as any).custom_fields[header] = value
          }
        })

        // Validate required fields
        if (!rowData.first_name || !rowData.email) {
          errors.push({
            row: i + 1,
            message: 'Missing required fields (first_name or email)',
            data: rowData
          })
          continue
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(rowData.email)) {
          errors.push({
            row: i + 1,
            message: `Invalid email format: ${rowData.email}`,
            data: rowData
          })
          continue
        }

        data.push(rowData)
      } catch (error) {
        errors.push({
          row: i + 1,
          message: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: { line }
        })
      }
    }

    return {
      data,
      errors,
      totalRows: lines.length - 1, // Exclude header
      validRows: data.length
    }
  }

  const handleFileSelection = async (file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      onUploadError('Please upload a CSV file')
      return
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      onUploadError('File size must be less than 10MB')
      return
    }

    setParsing(true)
    setParseResult(null)

    try {
      // Read and parse CSV
      const content = await file.text()
      const result = parseCSVContent(content)
      
      setParseResult(result)
      setShowPreview(true)
      
      console.log(`CSV parsed: ${result.validRows}/${result.totalRows} valid rows, ${result.errors.length} errors`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse CSV file'
      onUploadError(message)
      console.error('CSV parse error:', error)
    } finally {
      setParsing(false)
    }
  }

  const confirmImport = async () => {
    if (!parseResult || parseResult.data.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to upload prospects')
      }

      // Create CSV upload record
      const { data: uploadRecord, error: uploadError } = await supabase
        .from('csv_uploads')
        .insert({
          project_id: projectId,
          user_id: user.id,
          filename: fileInputRef.current?.files?.[0]?.name || 'upload.csv',
          file_size: fileInputRef.current?.files?.[0]?.size || 0,
          total_rows: parseResult.totalRows,
          status: 'processing'
        })
        .select()
        .single()

      if (uploadError || !uploadRecord) {
        throw new Error('Failed to create upload record')
      }

      // Insert prospects in batches
      const batchSize = 100
      let successCount = 0
      let failCount = 0
      const importErrors: any[] = []

      for (let i = 0; i < parseResult.data.length; i += batchSize) {
        const batch = parseResult.data.slice(i, i + batchSize)
        
        const prospectsToInsert = batch.map(row => ({
          project_id: projectId,
          user_id: user.id,
          first_name: row.first_name,
          last_name: row.last_name || null,
          email: row.email,
          company: row.company || null,
          title: row.title || null,
          phone: row.phone || null,
          custom_fields: (row as any).custom_fields || {}
        }))

        try {
          const { data, error } = await supabase
            .from('prospects')
            .insert(prospectsToInsert)
            .select('id')

          if (error) {
            // Handle unique constraint violations gracefully
            if (error.code === '23505') { // Unique violation
              failCount += batch.length
              importErrors.push({
                batch: i / batchSize + 1,
                message: 'Duplicate email addresses found in this batch',
                error: error.message
              })
            } else {
              throw error
            }
          } else {
            successCount += data?.length || 0
          }
        } catch (batchError) {
          failCount += batch.length
          importErrors.push({
            batch: i / batchSize + 1,
            message: batchError instanceof Error ? batchError.message : 'Batch insert failed',
            error: batchError
          })
        }

        // Update progress
        const progress = ((i + batchSize) / parseResult.data.length) * 100
        setUploadProgress(Math.min(progress, 100))
      }

      // Update upload record with results
      await supabase
        .from('csv_uploads')
        .update({
          successful_imports: successCount,
          failed_imports: failCount,
          status: importErrors.length === 0 ? 'completed' : 'completed',
          import_errors: importErrors,
          completed_at: new Date().toISOString()
        })
        .eq('id', uploadRecord.id)

      setUploadProgress(100)
      onUploadComplete(uploadRecord.id, successCount)
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import prospects'
      onUploadError(message)
      console.error('Import error:', error)
    } finally {
      setUploading(false)
      setShowPreview(false)
      setParseResult(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  if (showPreview && parseResult) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">CSV Import Preview</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{parseResult.totalRows}</div>
            <div className="text-sm text-blue-800">Total Rows</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{parseResult.validRows}</div>
            <div className="text-sm text-green-800">Valid Prospects</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{parseResult.errors.length}</div>
            <div className="text-sm text-red-800">Errors</div>
          </div>
        </div>

        {parseResult.errors.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-red-800 mb-2">Import Errors:</h4>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
              {parseResult.errors.slice(0, 10).map((error, index) => (
                <div key={index} className="text-sm text-red-700 mb-1">
                  Row {error.row}: {error.message}
                </div>
              ))}
              {parseResult.errors.length > 10 && (
                <div className="text-sm text-red-600 italic">
                  ... and {parseResult.errors.length - 10} more errors
                </div>
              )}
            </div>
          </div>
        )}

        {parseResult.data.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Preview (first 5 prospects):</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parseResult.data.slice(0, 5).map((prospect, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-sm text-gray-900">{prospect.first_name}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{prospect.last_name || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{prospect.email}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{prospect.company || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{prospect.title || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => {setShowPreview(false); setParseResult(null)}}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmImport}
            disabled={parseResult.validRows === 0 || uploading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? `Importing... ${uploadProgress.toFixed(0)}%` : `Import ${parseResult.validRows} Prospects`}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-colors
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${parsing ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
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
          accept=".csv"
          onChange={handleFileSelect}
        />

        <div className="text-center">
          {parsing ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">Parsing CSV file...</p>
                <p className="text-sm text-gray-500">Validating data and checking for errors</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <svg 
                className="mx-auto h-16 w-16 text-gray-400" 
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
                  Drop your CSV file here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports CSV files up to 10MB
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Required Columns:</h4>
                <p className="text-sm text-blue-700 mb-2">
                  <strong>first_name</strong> and <strong>email</strong>
                </p>
                <h4 className="text-sm font-medium text-blue-800 mb-2">Optional Columns:</h4>
                <p className="text-sm text-blue-700">
                  last_name, company, title, phone (+ any additional custom fields)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}