"use client";

import { format } from "date-fns";
import { AlertCircle, CalendarDays, FolderKanban, Activity } from "lucide-react";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetDashboardStats } from "@/features/dashboard/api/use-get-dashboard-stats";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";

import { TasksList } from "@/features/dashboard/components/tasks-list";
import { ProjectsList } from "@/features/dashboard/components/projects-list";
import { EventsList } from "@/features/dashboard/components/events-list";

import { WorkspaceProgressChart } from "@/features/dashboard/components/workspace-progress-chart";
import { WorkspaceActivityChart } from "@/features/dashboard/components/workspace-activity-chart";
import { VelocityChart } from "@/components/velocity-chart";
import { BurndownChart } from "@/components/burndown-chart";
import { Card, CardContent } from "@/components/ui/card";

export const DashboardClient = () => {
  const workspaceId = useWorkspaceId();
  
  const { data: permissions, isLoading: isLoadingPermissions } = useGetPermissions(workspaceId as string);

  const { data, isLoading: isLoadingStats, isError } = useGetDashboardStats({ 
    workspaceId: workspaceId as string 
  });

  const isLoading = isLoadingPermissions || isLoadingStats;

  if (isLoading) {
    return <div className="h-[60vh] flex items-center justify-center"><PageLoader /></div>;
  }

  if (isError || !data) {
    return <PageError message="Failed to load dashboard data" />;
  }

  const { urgentTasks, urgentProjects, activeProjects, upcomingEvents, activityData, memberVelocity, memberBurndown } = data;

  const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];

  const showWorkspaceCharts = permissionsList.includes(PERMISSIONS.WORKSPACE_VIEW_ANALYTICS);
  const showMemberCharts = !showWorkspaceCharts;
  const showProjectsList = permissionsList.includes(PERMISSIONS.WORKSPACE_VIEW_ALL_PROJECTS) || 
                           permissionsList.includes(PERMISSIONS.PROJECT_MANAGE_MEMBERS) || 
                           permissionsList.includes(PERMISSIONS.PROJECT_UPDATE);

  const topGridClass = showProjectsList 
    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" 
    : "grid grid-cols-1 lg:grid-cols-2 gap-6";

  return (
    <div className="h-full w-full flex flex-col space-y-6 pb-8 px-4 sm:px-6 pt-2">
      
      {/* 1. DATE & CONTEXT BADGE
      <div className="flex justify-between items-center w-full">
         <div>
            <h2 className="text-xl font-bold text-foreground">Workspace Overview</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Quick summary of all active projects and tasks.</p>
         </div>
         <div className="hidden sm:flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md border border-border shadow-sm">
            <CalendarDays className="size-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
         </div>
      </div> */}

      {/* 2. QUICK GLANCE KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Urgent Tasks</p>
              <p className="text-2xl font-bold text-foreground">{urgentTasks?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        {showProjectsList && (
          <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                <FolderKanban className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Critical Projects</p>
                <p className="text-2xl font-bold text-foreground">{urgentProjects?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
              <Activity className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Projects</p>
              <p className="text-2xl font-bold text-foreground">{activeProjects?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upcoming Events</p>
              <p className="text-2xl font-bold text-foreground">{upcomingEvents?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. CORE LISTS WIDGETS */}
      <div className={topGridClass}>
        <div className="flex flex-col gap-4">
          <TasksList data={urgentTasks} />
        </div>

        {showProjectsList && (
          <div className="flex flex-col gap-4">
            <ProjectsList data={urgentProjects} />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <EventsList data={upcomingEvents} />
        </div>
      </div>

      {/* 4. CHARTS SECTION */}
      {showWorkspaceCharts && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
          <WorkspaceProgressChart projects={activeProjects} />
          <WorkspaceActivityChart data={activityData} /> 
        </div>
      )}

      {showMemberCharts && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
          <VelocityChart 
            title="My Velocity" 
            description="Your task completion rate over the last 7 days" 
            data={memberVelocity} 
          />
          <BurndownChart 
            title="My Workload Burndown" 
            description="Your remaining pending tasks over time" 
            data={memberBurndown} 
          /> 
        </div>
      )}
      
    </div>
  );
};