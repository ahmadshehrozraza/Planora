"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
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
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { ActivityIcon } from "lucide-react";

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
    requiredPermission: PERMISSIONS.WORKSPACE_VIEW_ANALYTICS, 
  },
  { 
    label: "Members", 
    href: "/members", 
    icon: HiOutlineUsers, 
    activeIcon: HiUsers,
    requiredPermission: PERMISSIONS.WORKSPACE_MANAGE_MEMBERS, 
  },
  { 
    label: "Settings", 
    href: "/settings", 
    icon: HiOutlineCog, 
    activeIcon: HiCog,
    requiredPermission: PERMISSIONS.WORKSPACE_UPDATE, 
  },
  {
    label: "Activity Logs",
    href: "/activity",
    icon: ActivityIcon, 
    activeIcon: ActivityIcon,
    requiredPermission: PERMISSIONS.WORKSPACE_UPDATE,        
  }
];

export const Navigation = () => {
  const workspaceId = useWorkspaceId();

  const { data: userPermissions } = useGetPermissions(workspaceId as string);
  const permissionsList: string[] = Array.isArray(userPermissions) ? userPermissions : [];

  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar(); 

  const onLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const filteredRoutes = routes.filter((item) => {
    if (item.requiredPermission) {
      return permissionsList.includes(item.requiredPermission);
    }
    return true; 
  });

  return (
    <SidebarMenu>
      {filteredRoutes.map((item) => {
        const fullHref = `/workspaces/${workspaceId}${item.href}`;
        
        const isActive = item.href === ""
            ? pathname === `/workspaces/${workspaceId}`
            : pathname.startsWith(fullHref);
        
        const Icon = isActive ? item.activeIcon : item.icon;

        return (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.label}
              className="group/nav-item h-8" 
            >
              <Link 
                href={fullHref} 
                onClick={onLinkClick}
                className="flex items-center gap-2 w-full" 
              >
                <Icon className={cn(
                  "size-6 flex-shrink-0 transition-colors", 
                  isActive ? "text-primary" : "text-muted-foreground group-hover/nav-item:text-primary"
                )} />
                
                <span className="truncate font-medium text-sm group-data-[collapsible=icon]:hidden">
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