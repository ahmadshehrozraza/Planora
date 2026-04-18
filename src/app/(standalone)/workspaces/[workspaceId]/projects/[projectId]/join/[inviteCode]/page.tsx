import { redirect } from "next/navigation";
import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { JoinProjectClient } from "./client";

interface ProjectJoinPageProps {
  params: {
    workspaceId: string;
    projectId: string;
    inviteCode: string;
  };
}

export default async function ProjectJoinPage({ params }: ProjectJoinPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const project = await prisma.project.findUnique({
    where: {
      id: params.projectId,
      inviteCode: params.inviteCode,
    },
    select: { name: true, workspace: { select: { name: true } } }
  });

  if (!project) {
    redirect(`/workspaces/${params.workspaceId}`);
  }

  return (
    <JoinProjectClient 
        projectName={project.name} 
        workspaceName={project.workspace.name} 
    />
  );
}