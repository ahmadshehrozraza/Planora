"use client";

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

export const DashboardClient = () => {
  const workspaceId = useWorkspaceId();
  
  const { data: permissions, isLoading: isLoadingPermissions } = useGetPermissions(workspaceId as string);

  const { data, isLoading: isLoadingStats, isError } = useGetDashboardStats({ 
    workspaceId: workspaceId as string 
  });

  const isLoading = isLoadingPermissions || isLoadingStats;

  if (isLoading) {
    return <PageLoader />;
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

  return (
    <div className="h-full w-full flex flex-col space-y-6 pb-5">
      
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${showProjectsList ? 'xl:grid-cols-3' : ''} gap-4 items-start`}>
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

      {showWorkspaceCharts && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <WorkspaceProgressChart projects={activeProjects} />
          <WorkspaceActivityChart data={activityData} /> 
        </div>
      )}

      {showMemberCharts && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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