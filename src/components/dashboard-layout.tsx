"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { memo } from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardHeader = memo(() => (
  <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
    <SidebarTrigger className="-ml-1" />
    <div className="ml-auto">
      {/* Additional header content can go here */}
    </div>
  </header>
))

DashboardHeader.displayName = 'DashboardHeader'

export const DashboardLayout = memo(({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
})

DashboardLayout.displayName = 'DashboardLayout'