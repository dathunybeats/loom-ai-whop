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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
})

DashboardLayout.displayName = 'DashboardLayout'