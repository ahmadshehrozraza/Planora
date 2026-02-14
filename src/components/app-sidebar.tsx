"use client";

import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { WorkspaceSwitcher } from "./workspace-switcher";
import Image from "next/image";
import Link from "next/link";
import { Navigation } from "./navigation";
import { ProjectsSidebar } from "./projects-sidebar";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { NotificationButton } from "@/app/(dashboard)/workspaces/[workspaceId]/notifications/page";
import { ThemeToggle } from "./theme-toggle";

export function AppSidebar() {
  const { state, isMobile, openMobile, setOpenMobile, toggleSidebar } = useSidebar();
  const isExpanded = state === "expanded";

  useEffect(() => {
    const handleLinkClick = () => {
      if (isMobile && openMobile) {
        setOpenMobile(false);
      }
    };

    const handleCloseSidebar = () => {
      if (isMobile && openMobile) {
        setOpenMobile(false);
      }
    };

    const sidebarLinks = document.querySelectorAll('[data-sidebar="menu-button"] a');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });

    window.addEventListener('close-sidebar', handleCloseSidebar);

    return () => {
      sidebarLinks.forEach(link => {
        link.removeEventListener('click', handleLinkClick);
      });
      window.removeEventListener('close-sidebar', handleCloseSidebar);
    };
  }, [isMobile, openMobile, setOpenMobile]);

  return (
    <>
      {!isMobile && isExpanded && (
        <button
          onClick={toggleSidebar}
          className={cn(
            "fixed top-6 z-50",
            "h-10 w-5 rounded-r-xl",
            "bg-sidebar border-2 border-l-0 border-sidebar-border",
            "shadow-lg flex items-center justify-center",
            "transition-all duration-300",
            "hover:bg-sidebar-accent hover:w-9 hover:shadow-xl",
            "text-sidebar-foreground",
            "group/toggle"
          )}
          style={{
            left: "calc(16rem - 2px)",
          }}
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="h-5 w-5 transition-all group-hover/toggle:scale-110" />
        </button>
      )}

      {isMobile && !openMobile && (
        <button
          onClick={toggleSidebar}
          className={cn(
            "fixed top-4 left-4 z-50",
            "h-7 w-7 rounded-lg",
            "bg-sidebar border-2 border-sidebar-border",
            "shadow-lg flex items-center justify-center",
            "transition-all duration-300",
            "hover:bg-sidebar-accent hover:shadow-xl",
            "text-sidebar-foreground"
          )}
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      <Sidebar 
        collapsible="icon" 
        variant="sidebar" 
        className="border-r bg-sidebar"
      >
        <SidebarHeader className="p-4">
          {!isExpanded ? (
            <div className="flex flex-col items-center space-y-3">
              {!isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="h-8 w-8 rounded-xl flex items-center justify-center bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors shadow-sm"
                  aria-label="Expand sidebar"
                >
                  <ChevronRight className="h-6 w-6 text-sidebar-foreground" />
                </button>
              )}
            </div>
          ) : (
            <div className="">
              {/* <Link href="/" className="flex items-center gap-2">
                <Image 
                  src="/PlanoraLog.png" 
                  alt="Planora Logo" 
                  width={150}
                  height={40}
                  className="object-contain"
                />
              </Link> */}
              
              <Separator className="my-2" />
              <WorkspaceSwitcher />
            </div>
          )}
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <div>
                  <Navigation collapsed={!isExpanded} />
                  <ProjectsSidebar collapsed={!isExpanded} />
              </div>
              
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-2 border-t space-y-1">
          <NotificationButton collapsed={!isExpanded} />
          <ThemeToggle collapsed={!isExpanded} />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}