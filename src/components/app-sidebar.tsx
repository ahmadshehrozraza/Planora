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
import Link from "next/link";
import { Navigation } from "./navigation";
import { ProjectsSidebar } from "./projects-sidebar";
import { cn } from "@/lib/utils";
import { NotificationButton } from "@/components/notifications";
import { ThemeToggle } from "./theme-toggle";
import { PlanoraLogo } from "./planora-logo";

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
        className="border-r bg-sidebar h-screen overflow-hidden flex flex-col transition-[width] duration-300 ease-in-out"
      >
        
        <SidebarHeader className="shrink-0 ">
          
          <Link 
            href="/" 
            className={cn("flex items-center justify-center transition-all duration-300", isCollapsed ? "" : "justify-start")}
          >
             <PlanoraLogo 
               fontFamily="outfit"
               fontWeight="font-medium"
               wheelSize={isCollapsed ? 50 : 70} 
               wheelHandWidth={isCollapsed ? 2 : 3} 
               animateText={false}
               size={50} 
               wheelDuration="5s"
               hideText={isCollapsed}
             />
          </Link>
          
          <div className={cn(
              "transition-all duration-300 ease-in-out w-full",
              isCollapsed ? "px-0" : "px-2"
          )}>
            <Separator className="mb-2 w-full" />
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

        <SidebarFooter className="shrink-0">
          <NotificationButton />
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}