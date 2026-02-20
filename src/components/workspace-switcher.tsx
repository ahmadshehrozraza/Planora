"use client";

import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar";
import { 
  ChevronsUpDown, 
  Plus, 
  Loader 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger, 
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  useSidebar 
} from "@/components/ui/sidebar";

export const WorkspaceSwitcher = () => {
  const { data: workspaces, isLoading } = useGetWorkspaces();
  
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { open } = useCreateWorkspaceModal();
  const { isMobile } = useSidebar();

  const activeWorkspace = workspaces?.documents.find((w) => w.id === workspaceId);

  const onSelect = (id: string) => {
    router.push(`/workspaces/${id}`);
  };

  if (isLoading) {
      return (
          <SidebarMenu>
              <SidebarMenuItem>
                  <div className="h-8 w-full animate-pulse rounded-md bg-sidebar-accent/50" />
              </SidebarMenuItem>
          </SidebarMenu>
      )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border-border hover:bg-sidebar-accent"
            >
              {activeWorkspace ? (
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <WorkspaceAvatar 
                      name={activeWorkspace.name} 
                      image={activeWorkspace.imageUrl} 
                      size="sm"
                    />
                  </div>
              ) : (
                  <div className="size-8 rounded-lg bg-muted" />
              )}

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sidebar-foreground">
                  {activeWorkspace?.name || "Workspace"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {new Date(activeWorkspace?.createdDate || Date.now()).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-popover border-border"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            
            {workspaces?.documents.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => onSelect(workspace.id)}
                className="gap-2 p-2 cursor-pointer hover:bg-accent text-foreground"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border border-border">
                   <WorkspaceAvatar 
                      name={workspace.name} 
                      image={workspace.imageUrl} 
                      size="xs"
                    />
                </div>
                {workspace.name}
                {workspace.id === workspaceId && (
                   <span className="ml-auto text-xs text-muted-foreground">Active</span>
                )}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator className="bg-border" />
            
            <DropdownMenuItem className="gap-2 p-2 cursor-pointer hover:bg-accent" onClick={open}>
              <div className="flex size-6 items-center justify-center rounded-md border border-border bg-background">
                <Plus className="size-4 text-foreground" />
              </div>
              <div className="font-medium text-muted-foreground">Create Workspace</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};