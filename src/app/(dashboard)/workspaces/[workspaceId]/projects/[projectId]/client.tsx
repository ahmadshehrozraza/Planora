"use client";

import dynamic from "next/dynamic";
import { Settings2 } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { useGetProjectLogs } from "@/features/activity-logs/api/use-get-project-logs";
import { useGetProjectAnalytics } from "@/features/projects/api/use-get-project-analytics";

import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { SprintsPage } from "./sprints/page";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { ActivityTimeline } from "@/features/activity-logs/components/activity-timeline";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { ProjectRolesManager } from "@/features/custom-roles/components/project-roles";
import { ProjectDelete } from "@/features/projects/components/project-delete";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { ProjectFiles } from "@/features/projects/components/project-files";
import { ProjectTagsSettings } from "@/features/projects/components/project-tags-settings";
import { CPMGraph } from "@/features/projects/components/cpm-graph";
import { ProjectColumnsSettings } from "@/features/columns/components/columns-settings";
import { Navbar } from "@/components/navbar";

const EditProjectForm = dynamic(() => import("@/features/projects/components/edit-project-form").then((mod) => mod.EditProjectForm), { loading: () => <div className="p-8 flex justify-center"><PageLoader /></div> });
const ProjectAnalytics = dynamic(() => import("@/features/projects/components/project-analytics"), { ssr: false, loading: () => <div className="p-8 flex justify-center"><PageLoader /></div> });
const ProjectMembers = dynamic(() => import("@/features/projects/components/project-members").then((mod) => mod.ProjectMembers), { loading: () => <div className="p-8 flex justify-center"><PageLoader /></div> });
const ProjectRisks = dynamic(() => import("@/features/risks/components/project-risks").then((mod) => mod.ProjectRisks), { loading: () => <div className="p-8 flex justify-center"><PageLoader /></div> });
const ProjectEstimator = dynamic(() => import("@/features/projects/components/project-estimator").then((mod) => mod.ProjectEstimator), { loading: () => <div className="p-8 flex justify-center"><PageLoader /></div> });
const ProjectOverview = dynamic(() => import("@/features/projects/components/project-overview").then((mod) => mod.ProjectOverview), { ssr: false, loading: () => <div className="p-8 flex justify-center"><PageLoader /></div> });

export const ProjectIdClient = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const currentTab = searchParams.get("tab") || "overview";

  const handleTabChange = (value: string) => {
    router.push(`${pathname}?tab=${value}`, { scroll: false });
  };
  
  const { data: project, isLoading: isLoadingProject } = useGetProject({ projectId });
  const { data: projectLogs } = useGetProjectLogs(projectId);
  const { data: analytics } = useGetProjectAnalytics({ projectId });
  const { data: permissions } = useGetPermissions(workspaceId, projectId);
  
  const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];

  const isWorkspaceOwner = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE);
  const canViewAnalytics = isWorkspaceOwner || permissionsList.includes(PERMISSIONS.PROJECT_VIEW_ANALYTICS);
  const canManageMembers = isWorkspaceOwner || permissionsList.includes(PERMISSIONS.PROJECT_MANAGE_MEMBERS);
  const canUpdateProject = isWorkspaceOwner || permissionsList.includes(PERMISSIONS.PROJECT_UPDATE);
  const canViewRisks = isWorkspaceOwner || permissionsList.includes(PERMISSIONS.RISK_VIEW);

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case "overview": return "High-level summary of project health, AI insights, and active pipeline.";
      case "tasks": return "Manage, assign, and track all project tasks in detail.";
      case "sprints": return "Plan and execute your agile sprints and iterations.";
      case "risks": return "Identify and mitigate potential threats to project success.";
      case "files": return "Organize, upload, and manage project documents.";
      case "cpm": return "Critical Path Method analysis and network diagram.";
      case "projectAnalytics": return "In-depth executive reports, charts, and AI predictions.";
      case "projectMembers": return "Manage team access, roles, and view performance metrics.";
      case "projectSettings": return "Configure workflows, tags, estimations, and project details.";
      case "projectLogs": return "Audit trail of all activities and changes within the project.";
      default: return "Manage your project details and execution.";
    }
  };

  if (isLoadingProject) return <div className="h-[60vh] flex items-center justify-center"><PageLoader /></div>;
  if (!project) return <PageError message="Project not found" />;

  return (
    <div className="flex flex-col w-full h-full">
      <Navbar 
        title={project.name}
        description={getTabDescription(currentTab)} 
        avatar={<ProjectAvatar name={project.name} image={project.imageUrl} className="size-8 shadow-sm" />}
      />
      
      <div className="w-full flex flex-col min-h-screen bg-background">
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full flex flex-col flex-1">

         <div className="px-4 sm:px-6 py-3 bg-card border-b border-border sticky top-0 z-20 shadow-sm w-full overflow-x-auto no-scrollbar">
  <TabsList className="h-10 bg-muted/40 p-1 w-max border border-border justify-start rounded-lg">
    <TabsTrigger value="overview" className="px-4 text-xs sm:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md">Overview</TabsTrigger>
    <TabsTrigger value="tasks" className="px-4 text-xs sm:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md">Tasks</TabsTrigger>
    <TabsTrigger value="sprints" className="px-4 text-xs sm:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md">Sprints</TabsTrigger>
    
    {canViewRisks && (
      <TabsTrigger value="risks" className="px-4 text-xs sm:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md">
        Risks
      </TabsTrigger>
    )}
    
    <TabsTrigger value="files" className="px-4 text-xs sm:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md">Files</TabsTrigger>
    <TabsTrigger value="cpm" className="px-4 text-xs sm:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md">CPM</TabsTrigger>
    
    {canViewAnalytics && (
      <TabsTrigger value="projectAnalytics" className="px-4 text-xs sm:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md">Analytics</TabsTrigger>
    )}
    {canManageMembers && (
      <TabsTrigger value="projectMembers" className="px-4 text-xs sm:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md">Members</TabsTrigger>
    )}
    {canUpdateProject && (
      <TabsTrigger value="projectSettings" className="px-4 text-xs sm:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md">Settings</TabsTrigger>
    )}
    {canUpdateProject && (
      <TabsTrigger value="projectLogs" className="px-4 text-xs sm:text-sm text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md">Logs</TabsTrigger>
    )}
  </TabsList>
</div>

          <div className="flex-1 w-full relative">
            <TabsContent value="overview" className="m-0 border-none outline-none h-full w-full">
              <ProjectOverview analytics={analytics} logs={projectLogs || []} />
            </TabsContent>

            <TabsContent value="tasks" className="mt-3 border-none outline-none h-full w-full">
              <TaskViewSwitcher />
            </TabsContent>

            <TabsContent value="sprints" className="m-0 border-none outline-none h-full w-full">
              <SprintsPage />
            </TabsContent>

            {canViewRisks && (
              <TabsContent value="risks" className="m-0 border-none outline-none h-full p-4 lg:p-6 w-full">
                <ProjectRisks projectId={projectId} />
              </TabsContent>
            )}

            <TabsContent value="projectLogs" className="m-0 border-none outline-none p-4 lg:p-6 h-full w-full">
              <ActivityTimeline logs={projectLogs || []} />
            </TabsContent>

            <TabsContent value="cpm" className="mt-0 w-full p-4 lg:p-6">
              <div className="border border-border rounded-xl bg-card shadow-sm h-[600px] w-full overflow-hidden">
                <CPMGraph projectId={projectId} />
              </div>
            </TabsContent>

            <TabsContent value="projectAnalytics" className="m-0 w-full">
              <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden m-4 lg:m-6">
                <ProjectAnalytics projectId={projectId} />
              </div>
            </TabsContent>

            <TabsContent value="projectMembers" className="m-0 p-4 lg:p-6 w-full">
              <ProjectMembers projectId={projectId} />
            </TabsContent>

            <TabsContent value="files" className="m-0 p-4 lg:p-6 focus-visible:outline-none w-full">
               <ProjectFiles />
            </TabsContent>

            <TabsContent value="projectSettings" className="m-0 p-4 lg:p-6 w-full">
              <div className="flex flex-col gap-y-6 w-full">
                
                <Accordion type="multiple" defaultValue={["estimations", "general", "columns", "tags", "roles"]} className="w-full">
                  <AccordionItem value="estimations" className="border-2 border-blue-500/20 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 px-4 shadow-sm mb-4 w-full">
                    <AccordionTrigger className="hover:no-underline font-semibold text-lg py-4 text-blue-700 dark:text-blue-400">
                      AI Planning & COCOMO Estimations
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t border-blue-500/20 w-full">
                      <div className="mt-4 w-full block">
                        <ProjectEstimator projectId={projectId} initialData={project} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="general" className="border rounded-xl bg-card px-4 shadow-sm mb-4 w-full">
                    <AccordionTrigger className="hover:no-underline font-semibold text-lg py-4">General Details</AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t w-full">
                      <div className="mt-4 w-full block">
                        <EditProjectForm initialValues={project} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="columns" className="border rounded-xl bg-card px-4 shadow-sm mb-4 w-full">
                    <AccordionTrigger className="hover:no-underline font-semibold text-lg py-4">Board Columns & Workflow</AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t w-full">
                      <div className="mt-4 w-full block">
                        <ProjectColumnsSettings projectId={projectId} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="tags" className="border rounded-xl bg-card px-4 shadow-sm mb-4 w-full">
                    <AccordionTrigger className="hover:no-underline font-semibold text-lg py-4">Category Tags</AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t w-full">
                      <div className="mt-4 w-full block">
                        <ProjectTagsSettings projectId={projectId} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="roles" className="border rounded-xl bg-card px-4 shadow-sm mb-4 w-full">
                    <AccordionTrigger className="hover:no-underline font-semibold text-lg py-4">Roles & Permissions</AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t w-full">
                      <div className="mt-4 w-full block">
                        <ProjectRolesManager />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="danger" className="border border-destructive/20 rounded-xl bg-destructive/5 px-4 shadow-sm mb-4 w-full">
                    <AccordionTrigger className="hover:no-underline font-semibold text-lg py-4 text-destructive">Danger Zone</AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t border-destructive/20 w-full">
                      <div className="mt-4 w-full block">
                        <ProjectDelete workspaceId={workspaceId} projectId={projectId} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};