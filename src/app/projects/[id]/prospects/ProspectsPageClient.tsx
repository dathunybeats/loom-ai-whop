'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import CSVUploadModal from '@/components/CSVUploadModal'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

type Prospect = Database['public']['Tables']['prospects']['Row']
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
  const [selectedProspects, setSelectedProspects] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Filter and search prospects
  const filteredProspects = useMemo(() => {
    return prospects.filter(prospect => {
      const matchesSearch = searchTerm === '' || 
        prospect.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prospect.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        prospect.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prospect.company?.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = filterStatus === 'all' || prospect.video_status === filterStatus

      return matchesSearch && matchesStatus
    })
  }, [prospects, searchTerm, filterStatus])

  // Handle CSV upload success
  const handleCSVUploadSuccess = async (uploadId: string, prospectCount: number) => {
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

    alert(`Successfully imported ${prospectCount} prospects!`)
  }

  // Handle prospect selection
  const toggleProspectSelection = (prospectId: string) => {
    const newSelected = new Set(selectedProspects)
    if (newSelected.has(prospectId)) {
      newSelected.delete(prospectId)
    } else {
      newSelected.add(prospectId)
    }
    setSelectedProspects(newSelected)
  }

  const selectAllProspects = () => {
    if (selectedProspects.size === filteredProspects.length) {
      setSelectedProspects(new Set())
    } else {
      setSelectedProspects(new Set(filteredProspects.map(p => p.id)))
    }
  }

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedProspects.size === 0) return
    
    if (!confirm(`Delete ${selectedProspects.size} selected prospects?`)) return

    const supabase = createClient()
    const { error } = await supabase
      .from('prospects')
      .delete()
      .in('id', Array.from(selectedProspects))

    if (!error) {
      setProspects(prev => prev.filter(p => !selectedProspects.has(p.id)))
      setSelectedProspects(new Set())
      alert(`Successfully deleted ${selectedProspects.size} prospects`)
    } else {
      alert('Failed to delete prospects')
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800', 
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
            <LogoutButton />
          </div>

          {/* Actions Bar */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search prospects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      List
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Grid
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {selectedProspects.size > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {selectedProspects.size} selected
                      </span>
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setIsCSVUploadOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Add Prospects
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Prospects Content */}
          {filteredProspects.length === 0 ? (
            <div className="bg-white shadow rounded-lg">
              <div className="p-12 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {prospects.length === 0 ? 'No prospects yet' : 'No prospects match your filters'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {prospects.length === 0 
                    ? 'Upload a CSV file to get started with your prospects' 
                    : 'Try adjusting your search or filters to see more prospects'
                  }
                </p>
                {prospects.length === 0 && (
                  <button
                    onClick={() => setIsCSVUploadOpen(true)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Upload Prospects CSV
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              {viewMode === 'list' ? (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedProspects.size === filteredProspects.length && filteredProspects.length > 0}
                            onChange={selectAllProspects}
                            className="rounded"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prospect
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Added
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProspects.map((prospect) => (
                        <tr key={prospect.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedProspects.has(prospect.id)}
                              onChange={() => toggleProspectSelection(prospect.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {prospect.first_name} {prospect.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{prospect.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{prospect.company || '-'}</div>
                            <div className="text-sm text-gray-500">{prospect.title || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(prospect.video_status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(prospect.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/projects/${project.id}/prospects/${prospect.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProspects.map((prospect) => (
                    <div key={prospect.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <input
                          type="checkbox"
                          checked={selectedProspects.has(prospect.id)}
                          onChange={() => toggleProspectSelection(prospect.id)}
                          className="rounded"
                        />
                        {getStatusBadge(prospect.video_status)}
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {prospect.first_name} {prospect.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{prospect.email}</p>
                      </div>

                      {(prospect.company || prospect.title) && (
                        <div className="mb-4">
                          {prospect.company && (
                            <p className="text-sm font-medium text-gray-900">{prospect.company}</p>
                          )}
                          {prospect.title && (
                            <p className="text-sm text-gray-600">{prospect.title}</p>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Added {formatDate(prospect.created_at)}</span>
                        <Link
                          href={`/projects/${project.id}/prospects/${prospect.id}`}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={isCSVUploadOpen}
        onClose={() => setIsCSVUploadOpen(false)}
        projectId={project.id}
        onUploadSuccess={handleCSVUploadSuccess}
      />
    </div>
  )
}