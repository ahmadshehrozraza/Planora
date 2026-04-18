"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getSegmentAction({ segmentId }: { segmentId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const segment = await prisma.segment.findUnique({
            where: { id: segmentId },
            include: {
                project: { select: { workspaceId: true } }
            }
        });

        if (!segment) {
            throw new Error("Segment not found");
        }

        const isProjectMember = await prisma.projectMember.findUnique({
            where: { userId_projectId: { userId: user.id, projectId: segment.projectId } }
        });

        if (!isProjectMember) {
            const isWorkspaceMember = await prisma.workspaceMember.findUnique({
                where: { userId_workspaceId: { userId: user.id, workspaceId: segment.project.workspaceId } }
            });

            if (!isWorkspaceMember) {
                throw new Error("You do not have access to this segment");
            }
        }

        return {
            id: segment.id,
            name: segment.name,
            description: segment.description,
            status: segment.status,
            startDate: segment.startDate,
            dueDate: segment.dueDate,
            projectId: segment.projectId,
            createdAt: segment.createdAt,
            updatedAt: segment.updatedAt,
        };

    } catch (error: any) {
        throw new Error(error.message || "Failed to fetch segment");
    }
}