"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { generateInviteCode } from "@/lib/utils";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";
import { PERMISSIONS } from "@/lib/permissions-constants";

async function verifyAdmin(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    const isMember = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
        include: { role: true }
    });

    if (!isMember || !(isMember.role?.permissions.includes(PERMISSIONS.WORKSPACE_UPDATE) || isMember.role?.permissions.includes(PERMISSIONS.WORKSPACE_DELETE))) {
        throw new Error("Only admins can perform this action");
    }
    return session.user.id;
}

export async function updateWorkspaceAction(workspaceId: string, values: { name: string, imageUrl?: string | null }) {
    try {
        const actorId = await verifyAdmin(workspaceId);
        
        const oldWorkspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
        if (!oldWorkspace) throw new Error("Workspace not found");

        const isNameChanged = oldWorkspace.name !== values.name;

        const updated = await prisma.workspace.update({
            where: { id: workspaceId },
            data: { 
                name: values.name,
                imageUrl: values.imageUrl 
            } 
        });

        let changes = [];
        if (isNameChanged) changes.push(`renamed workspace from "${oldWorkspace.name}" to "${updated.name}"`);
        if (oldWorkspace.imageUrl !== updated.imageUrl) changes.push(`updated workspace icon`);

        if (changes.length > 0) {
            const logMessage = changes.join(" and ");

            await createAuditLog({
                workspaceId: updated.id,
                entityId: updated.id,
                entityType: ENTITY_TYPE.WORKSPACE,
                action: ACTION.UPDATE,
                metadata: {
                    title: updated.name,
                    message: logMessage
                }
            });

            const members = await prisma.workspaceMember.findMany({
                where: { workspaceId },
                select: { userId: true }
            });

            const userIdsToNotify = members.map(m => m.userId);

            if (userIdsToNotify.length > 0) {
                await createNotification({
                    userIds: userIdsToNotify,
                    actorId: actorId,
                    workspaceId: updated.id,
                    entityId: updated.id,
                    entityType: "WORKSPACE",
                    action: "UPDATED",
                    title: "Workspace Updated",
                    message: logMessage
                });
            }
        }

        eventEmitter.emit('invalidate');

        return { success: "Workspace updated!", data: updated };
    } catch (error: any) {
        return { error: error.message || "Failed to update workspace" };
    }
}

export async function deleteWorkspaceAction(workspaceId: string) {
    try {
        await verifyAdmin(workspaceId);
        
        await prisma.workspace.delete({ 
            where: { id: workspaceId } 
        });

        eventEmitter.emit('invalidate');

        return { success: "Workspace deleted!" };
    } catch (error: any) {
        return { error: error.message || "Failed to delete workspace" };
    }
}

export async function resetInviteCodeAction(workspaceId: string) {
    try {
        await verifyAdmin(workspaceId);
        
        const newCode = generateInviteCode(10);
        const updated = await prisma.workspace.update({
            where: { id: workspaceId },
            data: { inviteCode: newCode }
        });

        await createAuditLog({
            workspaceId: updated.id,
            entityId: updated.id,
            entityType: ENTITY_TYPE.WORKSPACE,
            action: ACTION.UPDATE,
            metadata: {
                message: `reset the workspace invite code`
            }
        });

        eventEmitter.emit('invalidate');

        return { success: "Invite code reset!", data: updated };
    } catch (error: any) {
        return { error: error.message || "Failed to reset invite code" };
    }
}