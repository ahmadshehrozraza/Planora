"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { useCurrentMember } from "@/features/members/hooks/current-user-role";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  HiOutlineHome,
  HiHome,
  HiOutlineCheckCircle,
  HiCheckCircle,
  HiOutlineCalendar,
  HiCalendar,
  HiOutlineUsers,
  HiUsers,
  HiOutlineCog,
  HiCog,
  HiOutlineChartBar,
  HiChartBar,
} from "react-icons/hi";

interface NavigationProps {
  collapsed?: boolean;
}

export const Navigation = ({ collapsed = false }: NavigationProps) => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  const { isAdmin } = useCurrentMember();
  const { isMobile } = useSidebar();

  const routes = [
    { 
      label: "Dashboard", 
      href: "", 
      icon: HiOutlineHome, 
      activeIcon: HiHome,
    },
    { 
      label: "Tasks", 
      href: "/tasks", 
      icon: HiOutlineCheckCircle, 
      activeIcon: HiCheckCircle,
    },
    { 
      label: "Events", 
      href: "/events", 
      icon: HiOutlineCalendar, 
      activeIcon: HiCalendar,
    },
    { 
        label: "Analytics", 
        href: "/analytics", 
        icon: HiOutlineChartBar, 
        activeIcon: HiChartBar,
      },
      { 
        label: "Members", 
        href: "/members", 
        icon: HiOutlineUsers, 
        activeIcon: HiUsers,
      },
      { 
        label: "Settings", 
        href: "/settings", 
        icon: HiOutlineCog, 
        activeIcon: HiCog,
      }
  ];

  const handleNavigationClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const event = new Event('close-sidebar');
      window.dispatchEvent(event);
    }
  };

  const shouldShowText = !collapsed || isMobile;

  return (
    <SidebarMenu>
      {routes.map((item) => {
        const fullHref = `/workspaces/${workspaceId}${item.href}`;
        const isActive =
          item.href === ""
            ? pathname === `/workspaces/${workspaceId}`
            : pathname.startsWith(fullHref);
        const Icon = isActive ? item.activeIcon : item.icon;

        return (
          <SidebarMenuItem key={item.href || "dashboard"} className="mb-0">
            <SidebarMenuButton
              asChild
              tooltip={collapsed && !isMobile ? item.label : undefined}
              isActive={isActive}
              onClick={handleNavigationClick}
              size="sm" 
              className="" 
            >
              <Link 
                href={fullHref} 
                className="flex items-center gap-2 w-full" 
                onClick={handleNavigationClick}
                prefetch
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0", 
                  isActive && "text-primary"
                )} />
                
                <span className={cn(
                  "truncate text-sm font-medium transition-all duration-200",
                  shouldShowText 
                    ? "opacity-100 w-auto ml-1"
                    : "opacity-0 w-0 ml-0"
                )}>
                  {item.label}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};