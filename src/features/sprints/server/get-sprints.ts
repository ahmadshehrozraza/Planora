"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getSprintsAction(projectId: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            throw new Error("Unauthorized");
        }

        if (!projectId || projectId === "all" || projectId === "undefined" || projectId === "null" || projectId === "none") {
            return [];
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const isMember = await prisma.projectMember.findUnique({
            where: { userId_projectId: { userId: user.id, projectId } }
        });

        if (!isMember) {
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                select: { workspaceId: true }
            });
            
            if (project) {
                const isWorkspaceAdmin = await prisma.workspaceMember.findUnique({
                    where: { userId_workspaceId: { userId: user.id, workspaceId: project.workspaceId } }
                });
                if (!isWorkspaceAdmin) throw new Error("Unauthorized access to sprints");
            }
        }

        const sprints = await prisma.sprint.findMany({
            where: { projectId },
            include: { tasks: true }, 
            orderBy: { createdAt: "desc" }
        });

        return sprints;
    } catch (error: any) {
        throw new Error("Failed to fetch sprints");
    }
}