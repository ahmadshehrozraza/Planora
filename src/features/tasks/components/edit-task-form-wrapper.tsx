"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useGetProjectMembers } from "@/features/members/api/use-get-dummy-members";
import { useGetDummyProjects } from "@/features/projects/api/use-get-dummy-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { useGetTask } from "../api/use-get-dummy-tasks";
import { EditTaskForm } from "./edit-task-form";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetSegments } from "@/features/segments/api/use-get-segment";

interface EditTaskFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const EditTaskFormWrapper = ({ 
  onCancel,
  id,
}: EditTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();

  // Use real API hooks
  const { data: taskData, isLoading: isLoadingTask } = useGetTask(id);
  if(!taskData) return;
  const { data: projectsData, isLoading: isLoadingProjects } = useGetDummyProjects(workspaceId);
  const { data: membersData, isLoading: isLoadingMembers } = useGetProjectMembers(taskData?.projectId);
  const { data: segmentsData, isLoading: isLoadingSegments } = useGetSegments(taskData?.projectId);

  const isLoading = isLoadingProjects || isLoadingMembers || isLoadingTask || isLoadingSegments;

  // Prepare project options
  const projectOptions = projectsData?.documents?.map((project) => ({
    id: project.id,
    name: project.name,
    imageUrl: project.imageUrl || '',
  })) || [];

  // Prepare member options
  const memberOptions = membersData?.documents?.map((member) => ({
    id: member.id,
    name: member.id,
    userId: "2",
  })) || [];


  // Prepare segment options for the task's project
  const segmentOptions = segmentsData?.documents
    ?.filter(segment => segment.projectId === taskData?.projectId)
    .map(segment => ({
      id: segment.id,
      name: segment.name,
    })) || [];

  if (isLoading) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

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