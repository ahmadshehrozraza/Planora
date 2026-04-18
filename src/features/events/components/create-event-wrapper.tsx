"use client";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { CreateEventForm } from "./create-event-form";
import { PageLoader } from "@/components/page-loader";
import { useGetProjects } from "@/features/projects/api/use-get-projects";

export const CreateEventWrapper = ({ onCancel }: { onCancel?: () => void }) => {
  const workspaceId = useWorkspaceId();
  
  const { data: projects, isLoading: loadingProjects } = useGetProjects({ workspaceId });

  if (loadingProjects) return <PageLoader />;

  return (
    <CreateEventForm 
      onCancel={onCancel} 
      workspaceId={workspaceId}
      projects={projects || []} 
    />
  );
};