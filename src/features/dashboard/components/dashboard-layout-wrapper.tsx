"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useSSE } from "@/hooks/use-sse";

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
}

export const DashboardLayoutWrapper = ({ children }: DashboardLayoutWrapperProps) => {

  useSSE();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        <div className="flex w-full h-full">
          
          <AppSidebar />
          
          <div className="flex-1 overflow-hidden">
            <div className="mx-auto max-w-screen-2xl h-full flex flex-col">

              {/* 
                   Yeh 'children' server se render ho kar aayenge.
                   SidebarProvider inhein "Client" mein convert nahi karega.
                */}
              <div className="flex-1 flex flex-col h-full w-full px-3">
                {children}
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};