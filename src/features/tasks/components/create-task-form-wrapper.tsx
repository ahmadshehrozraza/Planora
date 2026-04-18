"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { CreateTaskForm } from "./create-task-form";
import { PageLoader } from "@/components/page-loader";
import { useGetProjects } from "@/features/projects/api/use-get-projects";

interface CreateTaskFormWrapperProps {
  onCancel: () => void;
}

export const CreateTaskFormWrapper = ({ onCancel }: CreateTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  
  const { data: projectsData, isLoading: isLoadingProjects } = useGetProjects({workspaceId});

  if (!workspaceId) return null;

  if (isLoadingProjects) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <PageLoader />
        </CardContent>
      </Card>
    );
  }

  const projectOptions = projectsData?.map((p: any) => ({
    id: p.id,
    name: p.name,
    imageUrl: p.imageUrl || ""
  })) || [];

  return (
    <CreateTaskForm 
      onCancel={onCancel}
      projectOptions={projectOptions}
    />
  );
};