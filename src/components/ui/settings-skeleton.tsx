import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface SettingsSkeletonProps {
  className?: string
}

export const SettingsHeaderSkeleton = memo(({ className }: SettingsSkeletonProps) => (
  <div className={cn("space-y-2", className)}>
    <Skeleton className="h-9 w-32" />
    <Skeleton className="h-4 w-72" />
  </div>
))

SettingsHeaderSkeleton.displayName = 'SettingsHeaderSkeleton'

export const SettingsTabsSkeleton = memo(({ className }: SettingsSkeletonProps) => (
  <div className={cn("space-y-6", className)}>
    {/* Tabs List Skeleton */}
    <div className="grid w-full grid-cols-4 h-10 bg-muted rounded-lg p-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-8 rounded-md" />
      ))}
    </div>

    {/* Tab Content Skeleton */}
    <div className="space-y-6">
      <ProfileTabSkeleton />
    </div>
  </div>
))

SettingsTabsSkeleton.displayName = 'SettingsTabsSkeleton'

const ProfileTabSkeleton = memo(() => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-80" />
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <Skeleton className="w-20 h-20 rounded-full" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>

      {/* Phone Field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>

      {/* Company Field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>

      {/* Save Button */}
      <Skeleton className="h-10 w-32" />
    </CardContent>
  </Card>
))

ProfileTabSkeleton.displayName = 'ProfileTabSkeleton'

export const NotificationsTabSkeleton = memo(() => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
          {i < 3 && <div className="mt-6 border-t" />}
        </div>
      ))}
      <Skeleton className="h-10 w-36" />
    </CardContent>
  </Card>
))

NotificationsTabSkeleton.displayName = 'NotificationsTabSkeleton'

export const SecurityTabSkeleton = memo(() => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </CardContent>
    </Card>
  </div>
))

SecurityTabSkeleton.displayName = 'SecurityTabSkeleton'

export const BillingTabSkeleton = memo(() => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-4 w-72" />
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex items-center justify-between p-6 border rounded-lg">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Skeleton className="h-5 w-32 mx-auto" />
              <Skeleton className="h-8 w-16 mx-auto" />
              <Skeleton className="h-3 w-28 mx-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Skeleton className="h-5 w-24 mx-auto" />
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-3 w-36 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
    </CardContent>
  </Card>
))

BillingTabSkeleton.displayName = 'BillingTabSkeleton'

export const SettingsPageSkeleton = memo(({ className }: SettingsSkeletonProps) => (
  <div className={cn("space-y-6", className)}>
    <SettingsHeaderSkeleton />
    <SettingsTabsSkeleton />
  </div>
))

SettingsPageSkeleton.displayName = 'SettingsPageSkeleton'