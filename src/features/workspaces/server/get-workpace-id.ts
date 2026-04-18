"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getWorkspaceById(workspaceIdOrObject: any) {

    const workspaceId = typeof workspaceIdOrObject === "string" 
        ? workspaceIdOrObject 
        : workspaceIdOrObject?.workspaceId;

    if (!workspaceId) throw new Error("Workspace ID is required");

    const session = await auth();

    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) throw new Error("User not found");

    const workspace = await prisma.workspace.findFirst({
        where: {
            id: workspaceId,
            members: {
                some: {
                    userId: user.id 
                }
            }
        },
        include: {
            members: true, 
        }
    });

    if (!workspace) throw new Error("Workspace not found or unauthorized");

    return workspace;
}