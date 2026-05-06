import { Navbar } from "@/components/navbar";
import { SprintIdClient } from "./client";

export default async function SprintIdPage({
  params,
}: {
  params: { workspaceId: string; projectId: string; sprintId: string };
}) {
  return (
    <div className="flex flex-col w-full">
        <Navbar title="Sprint Details" description="View & manage your sprint details here" />
        <SprintIdClient 
          workspaceId={params.workspaceId} 
          projectId={params.projectId} 
          sprintId={params.sprintId} 
        />
    </div>
  );
}