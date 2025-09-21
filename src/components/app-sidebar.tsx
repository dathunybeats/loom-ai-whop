"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Folder,
  FileText,
  BarChart3,
  Database,
  Clipboard,
  Settings,
  HelpCircle,
  Users,
  Search,
  ArrowUp,
} from "lucide-react"

import { useSubscription } from "@/contexts/SubscriptionContext"
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
      icon: LayoutDashboard,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: Folder,
    },
    {
      title: "Voice Samples",
      url: "#",
      icon: FileText,
    },
    {
      title: "Analytics",
      url: "#",
      icon: BarChart3,
    },
  ],
  navClouds: [
    {
      title: "Projects",
      icon: Folder,
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
      icon: FileText,
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
      icon: Users,
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
      icon: FileText,
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
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircle,
    },
  ],
  documents: [
    {
      name: "Voice Library",
      url: "#",
      icon: Database,
    },
    {
      name: "Reports",
      url: "#",
      icon: Clipboard,
    },
    {
      name: "Templates",
      url: "#",
      icon: FileText,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, userData, loading } = useSubscription()

  // Use real user data from SubscriptionContext or fallback to default
  const displayUser = React.useMemo(() => {
    if (user) {
      return {
        name: userData?.full_name || user.user_metadata?.full_name || "User",
        email: user.email || "user@loom.ai",
        avatar: user.user_metadata?.avatar_url || "",
      }
    }
    return data.user
  }, [user, userData])

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
                <div className="h-5 w-5 flex-shrink-0">
                  <img
                    src="/Component 1.svg"
                    alt="Meraki Reach Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-base font-semibold">Meraki Reach</span>
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
        <NavUser user={displayUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
