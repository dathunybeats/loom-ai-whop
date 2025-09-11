import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
}

export const DashboardStatsLoading = memo(({ className }: LoadingSkeletonProps) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <div className="ml-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
))

DashboardStatsLoading.displayName = 'DashboardStatsLoading'

export const ProjectCardLoading = memo(({ className }: LoadingSkeletonProps) => (
  <div className={cn("bg-card border border-border rounded-lg p-6", className)}>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center justify-between pt-2">
        <div className="flex space-x-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  </div>
))

ProjectCardLoading.displayName = 'ProjectCardLoading'

export const ProjectsGridLoading = memo(({ className }: LoadingSkeletonProps) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
    {Array.from({ length: 6 }).map((_, i) => (
      <ProjectCardLoading key={i} />
    ))}
  </div>
))

ProjectsGridLoading.displayName = 'ProjectsGridLoading'

export const ProjectDetailLoading = memo(({ className }: LoadingSkeletonProps) => (
  <div className={cn("space-y-6", className)}>
    {/* Header */}
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-12 mt-2" />
        </div>
      ))}
    </div>

    {/* Content Area */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto mb-1" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto mb-1" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  </div>
))

ProjectDetailLoading.displayName = 'ProjectDetailLoading'

export const ProspectsListLoading = memo(({ className }: LoadingSkeletonProps) => (
  <div className={cn("space-y-6", className)}>
    {/* Header */}
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Search and Filter */}
    <div className="flex gap-4">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Table Header */}
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-5 gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      
      {/* Table Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="grid grid-cols-5 gap-4 items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
))

ProspectsListLoading.displayName = 'ProspectsListLoading'

export const ProspectDetailLoading = memo(({ className }: LoadingSkeletonProps) => (
  <div className={cn("space-y-6", className)}>
    {/* Header */}
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    {/* Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
))

ProspectDetailLoading.displayName = 'ProspectDetailLoading'

export const RecentCampaignsLoading = memo(({ className }: LoadingSkeletonProps) => (
  <div className={cn("bg-card border border-border rounded-lg", className)}>
    <div className="p-6 border-b border-border">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
    <div className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-3 h-3 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
))

RecentCampaignsLoading.displayName = 'RecentCampaignsLoading'