"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getSprintAction({ sprintId }: { sprintId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const sprint = await prisma.sprint.findUnique({
            where: { id: sprintId },
            include: {
                project: { select: { workspaceId: true } }
            }
        });

        if (!sprint) {
            throw new Error("Sprint not found");
        }

        const isProjectMember = await prisma.projectMember.findUnique({
            where: { userId_projectId: { userId: user.id, projectId: sprint.projectId } }
        });

        if (!isProjectMember) {
            const isWorkspaceMember = await prisma.workspaceMember.findUnique({
                where: { userId_workspaceId: { userId: user.id, workspaceId: sprint.project.workspaceId } }
            });

            if (!isWorkspaceMember) {
                throw new Error("You do not have access to this sprint");
            }
        }

        return {
            id: sprint.id,
            name: sprint.name,
            goal: sprint.goal,
            description: sprint.description,
            status: sprint.status,
            startDate: sprint.startDate,
            dueDate: sprint.dueDate,
            completedAt: sprint.completedAt,
            projectId: sprint.projectId,
            createdAt: sprint.createdAt,
            updatedAt: sprint.updatedAt,
        };

    } catch (error: any) {
        throw new Error(error.message || "Failed to fetch sprint");
    }
}