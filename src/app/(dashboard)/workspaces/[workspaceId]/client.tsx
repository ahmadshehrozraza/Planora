"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetMembers } from "@/features/members/api/use-get-dummy-members";
import { useGetDummyProjects } from "@/features/projects/api/use-get-dummy-projects";
import { useGetTasks } from "@/features/tasks/api/use-get-dummy-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { TasksList } from "@/features/dashboard/components/tasks-list";
import { ProjectsList } from "@/features/dashboard/components/projects-list";
import { MembersList } from "@/features/dashboard/components/members-list";
import { WorkspaceProgressChart } from "@/features/dashboard/components/workspace-progress-chart";
import { WorkspaceActivityChart } from "@/features/dashboard/components/workspace-activity-chart";
import { EventsList } from "@/features/dashboard/components/events-list";
import { useGetEvents } from "@/features/events/api/use-get-events";
import { ProjectBurndownChart } from "@/features/dashboard/components/project-burndown-chart";
import { ProjectCumulativeFlow } from "@/features/dashboard/components/project-cumulative-flow";
import { ProjectVelocityChart } from "@/features/dashboard/components/project-velocity-chart";
import React from "react";
import VerticalBarChart from "@/features/dashboard/components/vertical-bar-chart";

export const DashboardClient = () => {
  const workspaceId = useWorkspaceId();
  if (!workspaceId) return null;

  const { data: member, isLoading: isLoadingMember } = useGetMembers({
    workspaceId,
  });
  const { data: project, isLoading: isLoadingProject } =
    useGetDummyProjects(workspaceId);
  const { data: task, isLoading: isLoadingTask } = useGetTasks({ workspaceId });

  const { data: event, isLoading: isLoadingEvent } = useGetEvents({workspaceId});

  const isLoading = isLoadingMember || isLoadingProject || isLoadingTask || isLoadingEvent;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!task || !project || !member || !event) {
    return <PageError message="Failed to load workspace data" />;
  }

  return (
    <div className="h-full w-full flex flex-col space-y-4 pb-5">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <div className="flex flex-col gap-4">
          <TasksList
            data={task.documents}
            total={task.total}
            members={member.documents}
          />
          {/* <MembersList data={member.documents} total={member.total} /> */}
          <ProjectCumulativeFlow />
        </div>

        <div className="flex flex-col gap-4">
          {/* <ProjectsList data={project.documents} total={project.total} /> */}
          <EventsList data={event} total={event.length} />
          <VerticalBarChart />
        </div>
      </div>
      <WorkspaceProgressChart projects={project.documents} />
      {/* <WorkspaceActivityChart /> */}
      {/* <ProjectBurndownChart /> */}
      {/* <ProjectCumulativeFlow /> */}
      {/* <ProjectVelocityChart /> */}
    </div>
  );
};
