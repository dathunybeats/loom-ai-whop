'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import { ProspectsDataTable, type Prospect } from '@/components/ProspectsDataTable'
import { SimpleCSVUpload } from '@/components/SimpleCSVUpload'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Upload } from 'lucide-react'
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Link href={`/projects/${project.id}`} className="text-indigo-600 hover:text-indigo-500 text-sm">
                ← Back to Project
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">
                Prospects - {project.name}
              </h1>
              <p className="text-gray-600 mt-1">
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
              <LogoutButton />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white shadow rounded-lg p-6">
            <ProspectsDataTable
              data={prospects}
              onAddProspect={handleAddProspect}
              onDeleteSelected={handleDeleteSelected}
            />
          </div>
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
    </div>
  )
}