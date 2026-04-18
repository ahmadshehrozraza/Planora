"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";

export async function joinProjectAction({ 
    projectId, 
    workspaceId, 
    inviteCode 
}: { 
    projectId: string, 
    workspaceId: string, 
    inviteCode: string 
}) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true }
        });
        if (!user) throw new Error("User not found");

        const project = await prisma.project.findUnique({
            where: { id: projectId, workspaceId, inviteCode }
        });

        if (!project) {
            throw new Error("Invalid invite link or project not found");
        }

        const existingWorkspaceMember = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: user.id, workspaceId } }
        });

        if (!existingWorkspaceMember) {
            await prisma.workspaceMember.create({
                data: { userId: user.id, workspaceId, role: "MEMBER" }
            });
        }

        const existingProjectMember = await prisma.projectMember.findUnique({
            where: { userId_projectId: { userId: user.id, projectId } }
        });

        if (existingProjectMember) {
            return { success: true, message: "You are already a member of this project." };
        }

        const newMember = await prisma.projectMember.create({
            data: { userId: user.id, projectId, role: "MEMBER" }
        });

        await createAuditLog({
            workspaceId: workspaceId,
            projectId: projectId,
            entityId: newMember.id,
            entityType: ENTITY_TYPE.MEMBER,
            action: ACTION.CREATE,
            metadata: {
                message: `Joined the project via invite link`
            }
        });

        const projectManagers = await prisma.projectMember.findMany({
            where: {
                projectId,
                role: { in: ["ADMIN", "PROJECT_MANAGER"] }
            },
            select: { userId: true }
        });

        const managerIds = projectManagers.map(pm => pm.userId);

        if (managerIds.length > 0) {
            await createNotification({
                userIds: managerIds,
                actorId: user.id,
                workspaceId: workspaceId,
                projectId: projectId,
                entityId: projectId,
                entityType: "PROJECT",
                action: "ASSIGNED",
                title: "New Team Member",
                message: `joined the project "${project.name}"`
            });
        }

        eventEmitter.emit('invalidate');

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to join project" };
    }
}