"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";

export async function addProjectMemberAction({ 
    projectId, 
    userId, 
    role = "MEMBER" 
}: { 
    projectId: string, 
    userId: string, 
    role?: string 
}) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!currentUser) throw new Error("User not found");

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new Error("Project not found");

        const isWorkspaceAdmin = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: currentUser.id, workspaceId: project.workspaceId } }
        });

        const isProjectAdmin = await prisma.projectMember.findUnique({
            where: { userId_projectId: { userId: currentUser.id, projectId: projectId } }
        });

        if (
            isWorkspaceAdmin?.role !== "ADMIN" && 
            isProjectAdmin?.role !== "ADMIN" && 
            isProjectAdmin?.role !== "PROJECT_MANAGER"
        ) {
            throw new Error("You don't have permission to add members to this project");
        }

        const existingMember = await prisma.projectMember.findUnique({
            where: { userId_projectId: { userId, projectId } }
        });

        if (existingMember) {
            return { error: "User is already a member of this project" };
        }

        const newMember = await prisma.projectMember.create({
            data: {
                userId,
                projectId,
                role: role as any, 
            },
            include: {
                user: { select: { name: true } }
            }
        });

        await createAuditLog({
            workspaceId: project.workspaceId,
            projectId: project.id,
            entityId: newMember.id,
            entityType: ENTITY_TYPE.MEMBER,
            action: ACTION.CREATE,
            metadata: {
                message: `Added ${newMember.user?.name || "a user"} as ${role} to the project`
            }
        });

        await createNotification({
            userIds: [userId],
            actorId: currentUser.id,
            workspaceId: project.workspaceId,
            projectId: project.id,
            entityId: project.id,
            entityType: "PROJECT",
            action: "ASSIGNED",
            title: "Added to Project",
            message: `added you to the project "${project.name}" as ${role}`
        });

        eventEmitter.emit('invalidate');

        return { success: true, data: newMember };
    } catch (error: any) {
        return { error: error.message || "Failed to add member to project" };
    }
}