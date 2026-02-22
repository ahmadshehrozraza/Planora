"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useGetProjectMembers } from "@/features/members/api/use-get-dummy-members";
import { useGetDummyProjects } from "@/features/projects/api/use-get-dummy-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { useGetTask } from "../api/use-get-dummy-tasks";
import { EditTaskForm } from "./edit-task-form";
import { useGetSegments } from "@/features/segments/api/use-get-segment";

interface EditTaskFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const EditTaskFormWrapper = ({ onCancel, id }: EditTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();

  const { data: taskData, isLoading: isLoadingTask } = useGetTask(id);
  const { data: projectsData, isLoading: isLoadingProjects } = useGetDummyProjects(workspaceId);

  const projectId = taskData?.projectId || "";

  const { data: membersData, isLoading: isLoadingMembers } = useGetProjectMembers(projectId);
  const { data: segmentsData, isLoading: isLoadingSegments } = useGetSegments(projectId);

  const isLoading = isLoadingProjects || isLoadingMembers || isLoadingTask || isLoadingSegments;

  if (isLoading) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!taskData) return null;

  const projectOptions = projectsData?.documents?.map((project: any) => ({
    id: project.id,
    name: project.name,
    imageUrl: project.imageUrl || '',
  })) || [];

  const memberOptions = membersData?.documents?.map((member: any) => ({
    id: member.id,
    name: member.id,
    userId: "2",
  })) || [];

  const segmentOptions = segmentsData?.documents
    ?.filter((segment: any) => segment.projectId === taskData.projectId)
    .map((segment: any) => ({
      id: segment.id,
      name: segment.name,
    })) || [];

  return (
    <EditTaskForm 
      initialValues={taskData}
      onCancel={onCancel}
      projectOptions={projectOptions}
      memberOptions={memberOptions}
      segmentOptions={segmentOptions}
    />
  );
};