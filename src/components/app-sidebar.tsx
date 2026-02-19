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
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import Image from "next/image";
import Link from "next/link";
import { Navigation } from "./navigation";
import { ProjectsSidebar } from "./projects-sidebar";
import { cn } from "@/lib/utils";
import { NotificationButton } from "@/components/notifications";
import { ThemeToggle } from "./theme-toggle";
import { PlanoraLogo } from "@/features/dashboard/components/planora-logo";

export function AppSidebar() {
  const { isMobile, toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className={cn(
            "fixed top-6 z-50",
            "h-10 w-5 rounded-r-xl",
            "bg-sidebar border-2 border-l-0 border-sidebar-border",
            "shadow-lg flex items-center justify-center",
            "transition-all duration-300 ease-in-out",
            "hover:bg-sidebar-accent hover:w-9 hover:shadow-xl",
            "text-sidebar-foreground",
            "group/toggle"
          )}
          style={{ 
            left: isCollapsed ? "calc(3rem - 2px)" : "calc(16rem - 2px)" 
          }}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? (
             <ChevronRight className="h-5 w-5 transition-transform" />
          ) : (
             <ChevronLeft className="h-5 w-5 transition-transform" />
          )}
        </button>
      )}

      {isMobile && (
        <button
          onClick={toggleSidebar}
          className={cn(
            "fixed top-4 left-4 z-50 h-8 w-8 rounded-lg",
            "bg-sidebar border-2 border-sidebar-border",
            "shadow-lg flex items-center justify-center",
            "transition-all hover:bg-sidebar-accent",
            "text-sidebar-foreground"
          )}
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      <Sidebar 
        collapsible="icon" 
        variant="sidebar" 
        className="border-r bg-sidebar h-screen overflow-hidden flex flex-col"
      >
        
        <SidebarHeader className="p-2 shrink-0 transition-all">
          <div className="group-data-[collapsible=icon]:hidden transition-all duration-300 w-full overflow-hidden">
             <Link href="/" className="flex items-center gap-2 mb-1">
                <Image 
                  src="/PlanoraLog.png" 
                  alt="Planora Logo" 
                  width={200} 
                  height={40} 
                  className="object-contain min-w-[150px]" 
                  priority 
                />
             </Link>
             <Separator className="mb-2" />
          </div>

          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
             <PlanoraLogo duration="5s" size={50} handWidth={2} />
          </div>

          <WorkspaceSwitcher />
        </SidebarHeader>

        <SidebarContent 
          className={cn(
            "flex-1 min-h-0", 
            "!overflow-y-auto !overflow-x-hidden", 
            "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          )}
        >
          <SidebarGroup>
            <SidebarGroupContent>
              <Navigation />
              <ProjectsSidebar />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className=" shrink-0">
          <NotificationButton />
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}