"use client";

import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";

import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { WorkspaceRolesManager } from "@/features/custom-roles/components/workspace-roles";
import { WorkspaceDelete } from "@/features/workspaces/components/delete-workspace";

interface WorkspaceSettingsClientProps {
  workspaceId: string;
}

export const WorkspaceSettingsClient = ({ workspaceId }: WorkspaceSettingsClientProps) => {

  const { data: initialValues, isLoading } = useGetWorkspace({ workspaceId });

  if (isLoading) {
    return <PageLoader />
  }

  if (!initialValues) {
    return <PageError message="Workspace not found or you don't have access." />;
  }

  return (
    <div className="w-full px-5 flex flex-col gap-y-8 pb-10">

      
      <EditWorkspaceForm initialValues={initialValues} />
      
      <WorkspaceRolesManager /> 
      
      <WorkspaceDelete workspaceId={workspaceId} />
    </div>
  );
};