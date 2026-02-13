"use client";

import { BarChartBigIcon, BarChartIcon, CheckCircleIcon, HomeIcon, SettingsIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { GoCheckCircle, GoHome, GoHomeFill, GoCheckCircleFill } from "react-icons/go";
import { cn } from "@/lib/utils";

import { useCurrentMember } from "@/features/members/hooks/current-user-role";



export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();

  const { isAdmin } = useCurrentMember();

 const routes = [
    { 
      label: "Home", 
      href: "", 
      icon: HomeIcon, 
      activeIcon: GoHomeFill,
      badge: "",
    },
    { 
      label: "My Tasks", 
      href: "/tasks", 
      icon: CheckCircleIcon, 
      activeIcon: GoCheckCircleFill,
      badge: "",
    },
  ];

  if (isAdmin) {
    routes.push(
      { 
        label: "Members", 
        href: "/members", 
        icon: UsersIcon, 
        activeIcon: UsersIcon,
        badge: "Admin",
      },
      { 
        label: "Settings", 
        href: "/settings", 
        icon: SettingsIcon, 
        activeIcon: SettingsIcon,
        badge: "Admin",
      },
      // { 
      //   label: "Analytics", 
      //   href: "/analytics", 
      //   icon: BarChartIcon, 
      //   activeIcon: BarChartBigIcon,
      //   badge: "Admin",
      // }
    );
  }

  return (
    <ul className="flex flex-col">
      {routes.map((item) => {
        const fullHref = `/workspaces/${workspaceId}${item.href}`;
        const isActive =
          item.href === ""
            ? pathname === `/workspaces/${workspaceId}`
            : pathname.startsWith(fullHref);
        const Icon = isActive ? item.activeIcon : item.icon;

        return (
          <Link key={item.href} href={fullHref}>
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500 px-3 py-2",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </div>
          </Link>
        );
      })}
    </ul>
  );
};
