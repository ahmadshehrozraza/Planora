"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, Plus, ChevronRight, FolderOpen, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useGetDummyProjects } from "@/features/projects/api/use-get-dummy-projects";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export const ProjectsSidebar = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  const { open } = useCreateProjectModal();
  
  const [isOpen, setIsOpen] = useState(true);

  const { data, isLoading } = useGetDummyProjects(workspaceId);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleCreate = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    open();
  }, [open]);

  if (isLoading || !data) {
     return null; 
  }

  const projectsHref = `/workspaces/${workspaceId}/projects`;
  const isProjectsPageActive = pathname === projectsHref;

  return (
    <SidebarMenu className="">
        <SidebarMenuItem>
            <div className="flex w-full items-center gap-0.5 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-y-0.5 group-data-[collapsible=icon]:py-1">

                <div 
                    role="button"
                    onClick={handleCreate}
                    className="
                        hidden group-data-[collapsible=icon]:flex 
                        cursor-pointer text-muted-foreground hover:text-primary transition-colors
                        items-center justify-center size-5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800
                    "
                    title="Create Project"
                >
                    <Plus className="size-3.5" />
                </div>

                <SidebarMenuButton 
                    asChild
                    tooltip="Projects"
                    isActive={isProjectsPageActive}
                    className="group/nav-item h-8 cursor-pointer w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:p-0" 
                >
                    <div className="flex items-center mt-1 w-full">
                        <Link 
                            href={projectsHref} 
                            className="flex items-center gap-2 flex-1 overflow-hidden group-data-[collapsible=icon]:justify-center"
                        >
                            {isProjectsPageActive ? (
                                <FolderOpen className="size-4 shrink-0 text-primary transition-colors group-data-[collapsible=icon]:size-4" />
                            ) : (
                                <Folder className="size-4 shrink-0 text-muted-foreground group-hover/nav-item:text-primary transition-colors group-data-[collapsible=icon]:size-4" />
                            )}
                            
                            <span className="truncate font-medium text-sm group-data-[collapsible=icon]:hidden">
                                Projects
                            </span>
                        </Link>

                        <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                            <div 
                                role="button"
                                onClick={handleCreate}
                                className="
                                    flex items-center justify-center size-5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 
                                    cursor-pointer text-muted-foreground hover:text-primary 
                                    group-hover/nav-item:opacity-100 transition-all
                                "
                                title="Create Project"
                            >
                                <Plus className="size-4" />
                            </div>

                            <div 
                                role="button" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleOpen();
                                }}
                                className="flex items-center justify-center size-5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 cursor-pointer text-muted-foreground hover:text-primary transition-all"
                            >
                                <ChevronRight className={cn(
                                    "size-4 transition-transform duration-200",
                                    isOpen && "rotate-90"
                                )} />
                            </div>
                        </div>
                    </div>
                </SidebarMenuButton>

                <div 
                    role="button"
                    onClick={toggleOpen}
                    className="
                        hidden group-data-[collapsible=icon]:flex
                        cursor-pointer text-muted-foreground hover:text-primary transition-colors
                        items-center justify-center size-5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800
                    "
                    title="Toggle Projects"
                >
                    <ChevronDown className={cn(
                        "size-3.5 transition-transform duration-200",
                        isOpen ? "rotate-180" : "rotate-0"
                    )} />
                </div>

            </div>
        </SidebarMenuItem>

        {isOpen && data.documents.map((project) => {
            const projectHref = `/workspaces/${workspaceId}/projects/${project.id}`;
            const isProjectActive = pathname === projectHref || pathname.startsWith(projectHref + '/');

            return (
                <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                        asChild
                        isActive={isProjectActive}
                        tooltip={project.name}
                        // FIX: Negative margin removed (-ml-2.5px) and justify-center added for collapsed state
                        className="group/nav-item h-8 justify-start group-data-[collapsible=icon]:justify-center"
                    >
                        {/* FIX: w-full se collapsed state mein offset ka issue ho sakta tha, ab group-data mein w-auto kar diya aur justify center kar diya */}
                        <Link 
                            href={projectHref} 
                            className="flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto"
                        >
                            <ProjectAvatar
                                image={project.imageUrl}
                                name={project.name}
                                className={cn(
                                    "size-5 shrink-0", 
                                    isProjectActive ? "ring-1 ring-primary" : "opacity-80 group-hover/nav-item:opacity-100"
                                )}
                                fallbackClassName="text-[10px] font-bold" 
                            />
                            <span className={cn(
                                "truncate font-medium text-sm transition-colors group-data-[collapsible=icon]:hidden",
                                isProjectActive ? "text-primary" : "text-muted-foreground group-hover/nav-item:text-primary"
                            )}>
                                {project.name}
                            </span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        })}

        {isOpen && data.documents.length === 0 && (
             <SidebarMenuItem>
                <div className="px-2 py-1 text-xs text-muted-foreground italic group-data-[collapsible=icon]:hidden">
                    No projects found
                </div>
             </SidebarMenuItem>
        )}

    </SidebarMenu>
  );
};