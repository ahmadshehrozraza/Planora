"use client";

import { useRef, useState } from "react";
import { Plus, Download, LayoutTemplate } from "lucide-react";
import dynamic from "next/dynamic";

import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useCreateSprintModal } from "@/features/sprints/hooks/use-create-sprint-modal";

import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { SprintsPage } from "./sprints/page";
import { CreateSprintModal } from "@/features/sprints/components/create-sprint-modal";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { ActivityTimeline } from "@/features/activity-logs/components/activity-timeline";
import { useGetProjectLogs } from "@/features/activity-logs/api/use-get-project-logs";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { ProjectRolesManager } from "@/features/custom-roles/components/project-roles";
import { ProjectDelete } from "@/features/projects/components/project-delete";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { ProjectFiles } from "@/features/projects/components/project-files";
import { ProjectTagsSettings } from "@/features/projects/components/project-tags-settings";
import { CPMGraph } from "@/features/projects/components/cpm-graph";

const EditProjectForm = dynamic(
  () =>
    import("@/features/projects/components/edit-project-form").then(
      (mod) => mod.EditProjectForm,
    ),
  {
    loading: () => (
      <div className="p-8 flex justify-center">
        <PageLoader />
      </div>
    ),
  },
);
const ProjectAnalytics = dynamic(
  () => import("@/features/projects/components/project-analytics"),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 flex justify-center">
        <PageLoader />
      </div>
    ),
  },
);
const ProjectMembers = dynamic(
  () =>
    import("@/features/projects/components/project-members").then(
      (mod) => mod.ProjectMembers,
    ),
  {
    loading: () => (
      <div className="p-8 flex justify-center">
        <PageLoader />
      </div>
    ),
  },
);

export const ProjectIdClient = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const { data: project, isLoading: isLoadingProject } = useGetProject({
    projectId,
  });

  const { data: projectLogs } = useGetProjectLogs(projectId);

  const { data: permissions } = useGetPermissions(workspaceId, projectId);
  const permissionsList: string[] = Array.isArray(permissions)
    ? permissions
    : [];

  const isWorkspaceOwner = permissionsList.includes(
    PERMISSIONS.WORKSPACE_DELETE,
  );
  const canCreateSprint =
    isWorkspaceOwner || permissionsList.includes(PERMISSIONS.SPRINT_CREATE);
  const canViewAnalytics =
    isWorkspaceOwner ||
    permissionsList.includes(PERMISSIONS.PROJECT_VIEW_ANALYTICS);
  const canManageMembers =
    isWorkspaceOwner ||
    permissionsList.includes(PERMISSIONS.PROJECT_MANAGE_MEMBERS);
  const canUpdateProject =
    isWorkspaceOwner || permissionsList.includes(PERMISSIONS.PROJECT_UPDATE);

  const { open } = useCreateSprintModal();
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!printRef.current || !project) return;
    setIsExporting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.75);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const imgH = (imgHeight * pdfWidth) / imgWidth;

      let heightLeft = imgH;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgH);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgH);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${project.name.replace(/\s+/g, "_")}_Analytics_Report.pdf`);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoadingProject)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <PageLoader />
      </div>
    );
  if (!project) return <PageError message="Project not found" />;

  return (
    <div className="w-full flex flex-col min-h-screen bg-background">
      <Tabs defaultValue="tasks" className="w-full flex flex-col flex-1">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-6 py-4 gap-4 bg-card border-b border-border sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <ProjectAvatar
              name={project.name}
              className="size-10"
              image={project.imageUrl}
            />

            <div>
              <h1 className="font-bold text-lg text-foreground leading-none">
                {project.name}
              </h1>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Project Workspace
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
              <TabsTrigger
                value="sprints"
                className="px-5 text-sm data-[state=active]:shadow-sm"
              >
                Sprints
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="px-5 text-sm data-[state=active]:shadow-sm"
              >
                Files
              </TabsTrigger>
              <TabsTrigger
                value="cpm"
                className="px-5 text-sm data-[state=active]:shadow-sm"
              >
                CPM
              </TabsTrigger>
              {canViewAnalytics && (
                <TabsTrigger
                  value="projectAnalytics"
                  className="px-5 text-sm data-[state=active]:shadow-sm"
                >
                  Analytics
                </TabsTrigger>
              )}
              {canManageMembers && (
                <TabsTrigger
                  value="projectMembers"
                  className="px-5 text-sm data-[state=active]:shadow-sm"
                >
                  Members
                </TabsTrigger>
              )}
              {canUpdateProject && (
                <TabsTrigger
                  value="projectSettings"
                  className="px-5 text-sm data-[state=active]:shadow-sm"
                >
                  Settings
                </TabsTrigger>
              )}
              {canUpdateProject && (
                <TabsTrigger
                  value="projectLogs"
                  className="px-5 text-sm data-[state=active]:shadow-sm"
                >
                  Logs
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        </div>

        <div className="flex-1 w-full relative">
          <TabsContent
            value="tasks"
            className="mt-3 border-none outline-none h-full"
          >
            <TaskViewSwitcher />
          </TabsContent>

          <TabsContent
            value="sprints"
            className="m-0 border-none outline-none h-full"
          >
            <SprintsPage />
          </TabsContent>

          <TabsContent
            value="projectLogs"
            className="m-0 border-none outline-none p-4 h-full"
          >
            <ActivityTimeline logs={projectLogs || []} />
          </TabsContent>

          <TabsContent value="cpm" className="mt-0">
            <div className="border border-border rounded-lg bg-card shadow-sm h-[600px] w-full">
                <CPMGraph projectId={projectId} />
            </div>
          </TabsContent>

          <TabsContent value="projectAnalytics" className="m-0">
            <div className=" space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                  className="bg-background hover:bg-accent border-border shadow-sm text-foreground font-medium"
                >
                  {isExporting ? (
                    <>
                      <PageLoader /> Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="size-4 mr-2" /> Export Report
                    </>
                  )}
                </Button>
              </div>

              <div
                ref={printRef}
                className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden print-container"
              >
                <ProjectAnalytics projectId={projectId} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projectMembers" className="m-0 p-6">
            <div className=" ">
              <ProjectMembers projectId={projectId} />
            </div>
          </TabsContent>

          <TabsContent
            value="files"
            className="m-0 p-6 focus-visible:outline-none"
          >
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <ProjectFiles />
            </div>
          </TabsContent>

          <TabsContent value="projectSettings" className="m-0 p-6">
            <div className="flex flex-col gap-y-4">
              <EditProjectForm initialValues={project} />
              <ProjectTagsSettings projectId={projectId} />
              <ProjectRolesManager />
              <ProjectDelete workspaceId={workspaceId} projectId={projectId} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
