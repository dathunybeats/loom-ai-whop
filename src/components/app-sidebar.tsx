"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "User",
    email: "user@loom.ai",
    avatar: "", // Remove avatar to use icon fallback
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: FolderIcon,
    },
    {
      title: "Voice Samples",
      url: "#",
      icon: CameraIcon,
    },
    {
      title: "Analytics",
      url: "#",
      icon: BarChartIcon,
    },
  ],
  navClouds: [
    {
      title: "Projects",
      icon: FolderIcon,
      isActive: false,
      url: "/projects",
      items: [
        {
          title: "All Projects",
          url: "/projects",
        },
        {
          title: "New Project",
          url: "/projects/new",
        },
      ],
    },
    {
      title: "Video Production",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Base Videos",
          url: "#",
        },
        {
          title: "Generated Videos",
          url: "#",
        },
      ],
    },
    {
      title: "Prospects",
      icon: UsersIcon,
      url: "#",
      items: [
        {
          title: "All Prospects",
          url: "#",
        },
        {
          title: "CSV Uploads",
          url: "#",
        },
      ],
    },
    {
      title: "Campaigns",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Active Campaigns",
          url: "#",
        },
        {
          title: "Templates",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
  ],
  documents: [
    {
      name: "Voice Library",
      url: "#",
      icon: DatabaseIcon,
    },
    {
      name: "Reports",
      url: "#",
      icon: ClipboardListIcon,
    },
    {
      name: "Templates",
      url: "#",
      icon: FileIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <CameraIcon className="h-5 w-5 text-indigo-600" />
                <span className="text-base font-semibold">Loom.ai</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
