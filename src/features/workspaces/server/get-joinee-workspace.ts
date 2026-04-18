"use server";
import { prisma } from "@/lib/prisma";

export async function getJoineeWorkspace({ workspaceId }: { workspaceId: string }) {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true, imageUrl: true },
    });

    if (!workspace) throw new Error("Workspace not found");
    return workspace;
  } catch (error) {
    throw new Error("Failed to fetch workspace info");
  }
}