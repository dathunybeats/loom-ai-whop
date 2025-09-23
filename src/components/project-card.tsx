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
          <div className="flex items-center text-sm text-foreground font-normal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
              <path d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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