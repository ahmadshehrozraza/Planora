"use client";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetEvent } from "@/features/events/api/use-get-event";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { PageLoader } from "@/components/page-loader";
import { EditEventForm } from "./edit-event-form";

interface EditEventWrapperProps {
  onCancel?: () => void;
  eventId: string;
}

export const EditEventWrapper = ({ onCancel, eventId }: EditEventWrapperProps) => {
  const workspaceId = useWorkspaceId();

  const { data: initialValues, isLoading: isLoadingEvent } = useGetEvent({ eventId });

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });

  const isLoading = isLoadingEvent || isLoadingProjects;


  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        Event not found.
      </div>
    );
  }

  return (
    <EditEventForm
      onCancel={onCancel}
      initialValues={initialValues}
      projects={projects || []}
      workspaceId={workspaceId}
    />
  );
};