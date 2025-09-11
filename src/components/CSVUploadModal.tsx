'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import CSVUpload from './CSVUpload'

interface CSVUploadModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onUploadSuccess: (uploadId: string, prospectCount: number) => void
}

export default function CSVUploadModal({ 
  isOpen, 
  onClose, 
  projectId, 
  onUploadSuccess 
}: CSVUploadModalProps) {
  const handleUploadComplete = (uploadId: string, prospectCount: number) => {
    onUploadSuccess(uploadId, prospectCount)
    onClose()
  }

  const handleUploadError = (error: string) => {
    console.error('CSV upload error:', error)
    // Could add toast notification here
    alert(`Upload Error: ${error}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <DialogTitle>Upload Prospects CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file containing your prospect information. The system will automatically map common column names and validate the data.
            </DialogDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-amber-800 mb-2">📋 CSV Format Requirements:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li><strong>Required:</strong> first_name, email</li>
              <li><strong>Optional:</strong> last_name, company, title, phone</li>
              <li><strong>Custom fields:</strong> Any additional columns will be stored as custom fields</li>
              <li><strong>Column names:</strong> Case-insensitive, supports variations (firstname, fname, etc.)</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips for Best Results:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use standard column names when possible</li>
              <li>• Ensure email addresses are properly formatted</li>
              <li>• Remove any empty rows from your CSV</li>
              <li>• Include headers in the first row</li>
            </ul>
          </div>

          <CSVUpload
            projectId={projectId}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}