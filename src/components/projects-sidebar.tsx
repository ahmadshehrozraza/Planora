"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Folder, Plus, FolderOpen, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useCurrentMember } from "@/features/members/hooks/current-user-role";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { PageLoader } from "./page-loader";
import { useGetDummyProjects } from "@/features/projects/api/use-get-dummy-projects";

interface ProjectsProps {
  collapsed?: boolean;
}

export const ProjectsSidebar = ({ collapsed = false }: ProjectsProps) => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  const { open } = useCreateProjectModal();
  // const { isAdmin } = useCurrentMember();
  const { isMobile } = useSidebar();

  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);

  // const { data, isLoading } = useGetProjects({ workspaceId });

  const { data, isLoading } = useGetDummyProjects(workspaceId);

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleProjectsDropdown = () => {
    setShowProjectsDropdown(!showProjectsDropdown);
  };

  const isProjectExpanded = (projectId: string) =>
    expandedProjects.includes(projectId);

  if (isLoading) {
    return (
      <div className="flex place-content-center px-2">
        <PageLoader />
      </div>
    );
  }

  if (!data) return null;

  const shouldShowText = !collapsed || isMobile;

  if (collapsed && !isMobile) {
    const isProjectsPageActive = pathname === `/workspaces/${workspaceId}/projects`;

    return (
      <div className="flex flex-col items-center px-1">
        <SidebarMenuButton
          asChild
          tooltip="Projects"
          className="h-8"
        >
          <Link
            href={`/workspaces/${workspaceId}/projects`}
            className={cn(
              "flex items-center justify-center",
              isProjectsPageActive && "text-primary"
            )}
          >
            {isProjectsPageActive ? (
              <FolderOpen className="h-4 w-4 fill-primary" />
            ) : (
              <Folder className="h-4 w-4" />
            )}
          </Link>
        </SidebarMenuButton>
      </div>
    );
  }

  const isOnProjectsPage = pathname === `/workspaces/${workspaceId}/projects`;

  const hasProjects = data.documents.length > 0;

  return (
    <SidebarGroup className="mt-[-5px]">
      <div className="flex items-center justify-between">
        <SidebarGroupLabel className="text-sm text-neutral-500 px-0">
          <Link
            href={`/workspaces/${workspaceId}/projects`}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            {isOnProjectsPage ? (
              <FolderOpen className="h-4 w-4 fill-primary" />
            ) : (
              <Folder className="h-4 w-4" />
            )}
            <span className={cn(
              "ml-2",
              isOnProjectsPage && "text-primary font-medium"
            )}>
              Projects
            </span>
          </Link>
        </SidebarGroupLabel>

        {/* {isAdmin && ( */}
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={hasProjects ? toggleProjectsDropdown : open}
          title={hasProjects ? (showProjectsDropdown ? "Hide projects" : "Show projects") : "Add Project"}
        >
          {hasProjects ? (
            showProjectsDropdown ? (
              <ChevronUp className="h-2.5 w-2.5" />
            ) : (
              <ChevronDown className="h-2.5 w-2.5" />
            )
          ) : (
            <Plus className="h-2.5 w-2.5" />
          )}
          <span className="sr-only">
            {hasProjects
              ? (showProjectsDropdown ? "Hide projects" : "Show projects")
              : "Add Project"
            }
          </span>
        </Button>
        {/* )} */}
      </div>

      {hasProjects && showProjectsDropdown && (
        <SidebarGroupContent className="mt-1">
          <SidebarMenu className="space-y-0.5">
            {data.documents.map((project) => {
              const projectHref = `/workspaces/${workspaceId}/projects/${project.id}`;
              const isProjectActive = pathname === projectHref || pathname.startsWith(projectHref + '/');
              const isExpanded = isProjectExpanded(project.id);

              return (
                <div key={project.id} className="group">
                  <SidebarMenuItem className="mb-0">
                    <div className="flex items-center w-full pl-0">
                      <SidebarMenuButton
                        asChild
                        isActive={isProjectActive}
                        className="flex-1 h-8 px-2"
                      >
                        <Link
                          href={projectHref}
                          className="flex items-center gap-1.5 w-full"
                        >
                          <ProjectAvatar
                            image={project.imageUrl}
                            name={project.name}
                            className={cn(
                              "size-5",
                              isProjectActive && "ring-1 ring-primary"
                            )}
                          />
                          <span className={cn(
                            "truncate text-sm px-1",
                            isProjectActive && "text-primary font-medium"
                          )}>
                            {project.name}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </div>
                  </SidebarMenuItem>
                </div>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
};