import { Navbar } from "@/components/navbar";
import { WorkspaceSettingsClient } from "./client";

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  return (
    <div className="flex flex-col">
      <Navbar title="Workspace Settings" description="Manage your workspace preferences, roles, and security here." />
      <WorkspaceSettingsClient workspaceId={params.workspaceId} />
    </div>
  );
}