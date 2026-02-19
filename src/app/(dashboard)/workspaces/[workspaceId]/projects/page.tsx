import { Navbar } from "@/components/navbar";
import { ProjectsClient } from "./client";

export default async function ProjectsPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  return (
    <div className="">
        <Navbar title="Projects" description="Manage & view all your projects here" />
        <ProjectsClient workspaceId={params.workspaceId} />
    </div>
  );
}