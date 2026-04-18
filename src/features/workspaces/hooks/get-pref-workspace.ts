"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getPrefWorkspace() {
  try {
    const session = await auth();
    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        preferences: { select: { lastWorkspaceId: true } } 
      }
    });
    
    if (!user) return null;

    const lastWorkspaceId = user.preferences?.lastWorkspaceId;

    if (lastWorkspaceId) {
      const isStillMember = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId: lastWorkspaceId
          }
        }
      });

      if (isStillMember) return lastWorkspaceId;
    }

    const fallbackWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: { workspaceId: true }
    });

    if (fallbackWorkspace) return fallbackWorkspace.workspaceId;

    return null;
  } catch (error) {
    return null;
  }
}