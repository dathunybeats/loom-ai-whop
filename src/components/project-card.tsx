"use client"

import { memo } from 'react'
import Link from 'next/link'
import { preloadRoute } from '@/lib/performance'

interface Project {
  id: string
  name: string
  description: string | null
  base_video_url: string | null
  created_at: string
}

interface ProjectCardProps {
  project: Project
}

const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  // Enhanced preloading with intelligent priority
  const handleMouseEnter = () => {
    preloadRoute(`/projects/${project.id}`, 'high')
  }

  return (
    <div 
      className="bg-card border border-border overflow-hidden rounded-lg hover:shadow-md transition-all duration-200"
      onMouseEnter={handleMouseEnter}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-card-foreground truncate">
            {project.name}
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            project.base_video_url 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
          }`}>
            {project.base_video_url ? 'Ready' : 'Setup needed'}
          </span>
        </div>
        
        {project.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {new Date(project.created_at).toLocaleDateString()}
          </div>
          
          <Link
            href={`/projects/${project.id}`}
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            View Project
          </Link>
        </div>
      </div>
    </div>
  )
})

export { ProjectCard }