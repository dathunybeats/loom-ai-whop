"use client"

import * as React from "react"
import Link from "next/link"
import {
  Settings,
  HelpCircle,
  Users,
  Search,
  ArrowUp,
} from "lucide-react"

import { useSubscription } from "@/contexts/SubscriptionContext"

// Custom SVG Icons
const DashboardIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="30" height="30" rx="5" stroke="currentColor" strokeWidth="2.5"/>
    <path d="M2 18H9.53846C10.1097 18 10.6575 18.281 11.0615 18.7811C11.4654 19.2811 11.6923 19.9594 11.6923 20.6667C11.6923 22.0812 12.1462 23.4377 12.954 24.4379C13.7619 25.4381 14.8575 26 16 26C17.1425 26 18.2381 25.4381 19.046 24.4379C19.8538 23.4377 20.3077 22.0812 20.3077 20.6667C20.3077 19.9594 20.5346 19.2811 20.9385 18.7811C21.3425 18.281 21.8903 18 22.4615 18H30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const FolderIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 7L11.8845 4.76892C11.5634 4.1268 11.4029 3.80573 11.1634 3.57116C10.9516 3.36373 10.6963 3.20597 10.4161 3.10931C10.0992 3 9.74021 3 9.02229 3H5.2C4.0799 3 3.51984 3 3.09202 3.21799C2.71569 3.40973 2.40973 3.71569 2.21799 4.09202C2 4.51984 2 5.0799 2 6.2V7M2 7H17.2C18.8802 7 19.7202 7 20.362 7.32698C20.9265 7.6146 21.3854 8.07354 21.673 8.63803C22 9.27976 22 10.1198 22 11.8V16.2C22 17.8802 22 18.7202 21.673 19.362C21.3854 19.9265 20.9265 20.3854 20.362 20.673C19.7202 21 18.8802 21 17.2 21H6.8C5.11984 21 4.27976 21 3.63803 20.673C3.07354 20.3854 2.6146 19.9265 2.32698 19.362C2 18.7202 2 17.8802 2 16.2V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const AnalyticsIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 13V17M16 11V17M12 7V17M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const AudioIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10L3 14M7.5 6L7.5 18M12 3V21M16.5 6V18M21 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const UserIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.3163 19.4384C5.92462 18.0052 7.34492 17 9 17H15C16.6551 17 18.0754 18.0052 18.6837 19.4384M16 9.5C16 11.7091 14.2091 13.5 12 13.5C9.79086 13.5 8 11.7091 8 9.5C8 7.29086 9.79086 5.5 12 5.5C14.2091 5.5 16 7.29086 16 9.5ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const VideoIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 8.93137C22 8.32555 22 8.02265 21.8802 7.88238C21.7763 7.76068 21.6203 7.69609 21.4608 7.70865C21.2769 7.72312 21.0627 7.93731 20.6343 8.36569L17 12L20.6343 15.6343C21.0627 16.0627 21.2769 16.2769 21.4608 16.2914C21.6203 16.3039 21.7763 16.2393 21.8802 16.1176C22 15.9774 22 15.6744 22 15.0686V8.93137Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 9.8C2 8.11984 2 7.27976 2.32698 6.63803C2.6146 6.07354 3.07354 5.6146 3.63803 5.32698C4.27976 5 5.11984 5 6.8 5H12.2C13.8802 5 14.7202 5 15.362 5.32698C15.9265 5.6146 16.3854 6.07354 16.673 6.63803C17 7.27976 17 8.11984 17 9.8V14.2C17 15.8802 17 16.7202 16.673 17.362C16.3854 17.9265 15.9265 18.3854 15.362 18.673C14.7202 19 13.8802 19 12.2 19H6.8C5.11984 19 4.27976 19 3.63803 18.673C3.07354 18.3854 2.6146 17.9265 2.32698 17.362C2 16.7202 2 15.8802 2 14.2V9.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { SubscriptionStatusCard } from "@/components/subscription-status-card"
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
      icon: DashboardIcon,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: FolderIcon,
    },
    {
      title: "Voice Samples",
      url: "#",
      icon: AudioIcon,
      isUpcoming: true,
    },
    {
      title: "Analytics",
      url: "#",
      icon: AnalyticsIcon,
      isUpcoming: true,
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
      icon: VideoIcon,
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
      icon: UserIcon,
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
      icon: VideoIcon,
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
      icon: AudioIcon,
      isUpcoming: true,
    },
    {
      name: "Reports",
      url: "#",
      icon: AnalyticsIcon,
      isUpcoming: true,
    },
    {
      name: "Templates",
      url: "#",
      icon: FolderIcon,
      isUpcoming: true,
    },
  ],
}

export function AppSidebar({ variant = "sidebar", ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, userData, loading } = useSubscription()
  const [isClient, setIsClient] = React.useState(false)

  // Ensure we only show dynamic user data after hydration
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // Use real user data from SubscriptionContext or fallback to default
  const displayUser = React.useMemo(() => {
    // Always return fallback data during SSR and initial client render
    if (!isClient) {
      return data.user
    }

    // After hydration, use real user data if available
    if (user) {
      return {
        name: userData?.full_name || user.user_metadata?.full_name || "User",
        email: user.email || "user@loom.ai",
        avatar: user.user_metadata?.avatar_url || "",
      }
    }
    return data.user
  }, [user, userData, isClient])

  return (
    <Sidebar variant={variant} collapsible="offcanvas" {...props}>
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
        <SubscriptionStatusCard />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
