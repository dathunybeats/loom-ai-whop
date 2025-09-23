"use client"

import { PlusCircleIcon, type LucideIcon } from "lucide-react"
import { ComponentType } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Chip } from "@heroui/react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon | ComponentType<{ className?: string }>
    isUpcoming?: boolean
  }[]
}) {
  const pathname = usePathname()
  const router = useRouter()

  // Prefetch all navigation routes on component mount for instant navigation
  useEffect(() => {
    items.forEach(item => {
      router.prefetch(item.url)
    })
    router.prefetch('/projects/new')
  }, [items, router])

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              asChild
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground flex-1"
            >
              <Link
                href="/projects/new"
                onMouseEnter={() => router.prefetch('/projects/new')}
                className="transition-colors duration-75"
              >
                <PlusCircleIcon />
                <span>Quick Create</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild={!item.isUpcoming}
                tooltip={item.isUpcoming ? `${item.title} (Coming Soon)` : item.title}
                isActive={pathname === item.url}
                className={item.isUpcoming ? "opacity-50 cursor-not-allowed" : ""}
              >
                {item.isUpcoming ? (
                  <div className="flex items-center gap-2 w-full">
                    {item.icon && <item.icon />}
                    <span className="flex-1">{item.title}</span>
                    <Chip color="danger" size="sm" className="scale-75">
                      Soon
                    </Chip>
                  </div>
                ) : (
                  <Link
                    href={item.url}
                    onMouseEnter={() => router.prefetch(item.url)}
                    className="transition-colors duration-75"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
