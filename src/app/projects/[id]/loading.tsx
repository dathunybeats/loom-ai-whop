import { DashboardLayout } from '@/components/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProjectLoading() {
  return (
    <DashboardLayout>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto py-4 sm:py-6">
          <div className="px-3 sm:px-4">
            {/* Header skeleton */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48 mt-1" />
              </div>
              <Skeleton className="h-10 w-20" />
            </div>

            {/* Video preview skeleton */}
            <div className="mb-6 bg-card border border-border shadow-sm rounded-lg">
              <div className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-24" />
                </div>
                
                <div className="w-full">
                  <div className="relative w-full max-w-4xl mx-auto">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <div className="absolute inset-0">
                        <Skeleton className="w-full h-full rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Skeleton className="h-12 w-full mt-4" />
              </div>
            </div>
            
            {/* Action cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border border-border overflow-hidden shadow-sm rounded-lg">
                  <div className="p-4 sm:p-5">
                    <Skeleton className="h-10 w-10 rounded-md mb-4" />
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats skeleton */}
            <div className="mt-6 bg-card border border-border shadow-sm rounded-lg">
              <div className="px-3 sm:px-4 py-4 sm:py-5">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}