"use client";

import { useGetDummyWorkspaces } from "@/features/workspaces/api/use-get-dummy-workspaces";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function WorkspacesPage() {
  const { data: workspacesData, isLoading } = useGetDummyWorkspaces();

  useEffect(() => {
    if (!isLoading && workspacesData?.documents && workspacesData.documents.length > 0) {
      const firstWorkspaceId = workspacesData.documents[0].id;
      redirect(`/workspaces/${firstWorkspaceId}`);
    }
  }, [workspacesData, isLoading]);

  if (isLoading) {
    return <div>Loading workspaces...</div>;
  }

  if (!isLoading && (!workspacesData?.documents || workspacesData.documents.length === 0)) {
    redirect("/workspaces/create");
  }

  return <div>Redirecting to your workspace...</div>;
}