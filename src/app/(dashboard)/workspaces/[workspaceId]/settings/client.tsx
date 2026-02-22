"use client";

import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";

interface WorkspaceSettingsClientProps {
  workspaceId: string;
}

export const WorkspaceSettingsClient = ({ workspaceId }: WorkspaceSettingsClientProps) => {

  const { data: initialValues, isLoading } = useGetWorkspace({ workspaceId });

  if (isLoading) {
    return <div className="h-[60vh] flex items-center justify-center"><PageLoader /></div>;
  }

  if (!initialValues) {
    return <PageError message="Workspace not found or you don't have access." />;
  }

  return (
    <div className="w-full flex flex-col">
      <EditWorkspaceForm initialValues={initialValues} />
    </div>
  );
};