"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  LayoutTemplate,
} from "lucide-react";
import dynamic from "next/dynamic";

import { useGetSprint } from "@/features/sprints/api/use-get-sprint";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { SprintFiles } from "@/features/projects/components/project-files";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";

const TaskViewSwitcher = dynamic(
  () =>
    import("@/features/tasks/components/task-view-switcher").then(
      (mod) => mod.TaskViewSwitcher,
    ),
  {
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <PageLoader />
      </div>
    ),
  }
);

const EditSprintForm = dynamic(
  () =>
    import("@/features/sprints/components/edit-sprint-form").then(
      (mod) => mod.EditSprintForm,
    ),
  {
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <PageLoader />
      </div>
    ),
  }
);

interface SprintIdClientProps {
  workspaceId: string;
  projectId: string;
  sprintId: string;
}

export const SprintIdClient = ({
  workspaceId,
  projectId,
  sprintId,
}: SprintIdClientProps) => {
  const { data: sprint, isLoading, error } = useGetSprint(sprintId);

  const { data: permissions } = useGetPermissions(workspaceId, projectId);
  const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];
  const allowed = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.PROJECT_MANAGE_MEMBERS);

  if (isLoading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (error || !sprint) {
    return (
      <PageError message="Error loading sprint details. It might have been deleted." />
    );
  }

  return (
    <div className="w-full space-y-6 flex flex-col h-full">
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList className="text-sm font-medium">
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/workspaces/${workspaceId}/projects`}
                className="hover:text-primary transition-colors text-muted-foreground"
              >
                Projects
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/workspaces/${workspaceId}/projects/${projectId}`}
                className="hover:text-primary transition-colors text-muted-foreground"
              >
                Project Overview
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-bold flex items-center gap-2">
                <LayoutTemplate className="size-4 text-primary" />
                {sprint.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Tabs defaultValue="tasks" className="flex flex-col flex-1 h-full w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-6 py-4 gap-4 border-b border-border bg-card mb-5 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20 hidden sm:block">
              <LayoutTemplate className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground leading-none">
                {sprint.name}
              </h1>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Sprint Details
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <TabsList className="h-10 bg-muted/80 p-1 w-full lg:w-auto overflow-x-auto justify-start border border-border">
              <TabsTrigger
                value="tasks"
                className="px-5 text-sm data-[state=active]:shadow-sm"
              >
                Tasks
              </TabsTrigger>
              

              {allowed && (
              <TabsTrigger
                value="settings"
                className="px-5 text-sm data-[state=active]:shadow-sm"
              >
                Settings
              </TabsTrigger>
              )}
            </TabsList>
          </div>
        </div>

        <div className="flex-1 w-full rounded-xl shadow-sm border-none bg-card overflow-hidden min-h-[500px]">
          <TabsContent
            value="tasks"
            className="m-0 p-0 h-full border-none focus-visible:outline-none"
          >
            <TaskViewSwitcher />
          </TabsContent>

          

          <TabsContent
            value="settings"
            className="m-0 p-6 focus-visible:outline-none"
          >
            <div className="w-full">
              <EditSprintForm initialValues={{...sprint, status: sprint.status as any}} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};