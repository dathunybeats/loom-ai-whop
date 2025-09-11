import { DashboardLayout } from '@/components/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Settings Form Skeleton */}
        <div className="max-w-2xl space-y-8">
          {/* Profile Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Video Settings Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}