"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";

export async function joinWorkspaceAction({ workspaceId, inviteCode }: { workspaceId: string, inviteCode: string }) {
    try {
        const session = await auth();

        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true } 
        });

        if (!user) throw new Error("User not found");
        const userId = user.id;

        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId }
        });

        if (!workspace || workspace.inviteCode !== inviteCode) {
            throw new Error("Invalid or expired invite code");
        }

        const existingMember = await prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: { userId, workspaceId }
            }
        });

        if (existingMember) {
            return { success: "You are already a member of this workspace", data: workspace };
        }

        const newMember = await prisma.workspaceMember.create({
            data: {
                userId,
                workspaceId,
                role: "MEMBER"
            }
        });

        await createAuditLog({
            workspaceId,
            entityId: newMember.id,
            entityType: ENTITY_TYPE.MEMBER,
            action: ACTION.CREATE,
            metadata: {
                message: `joined the workspace via invite link`
            }
        });

        const admins = await prisma.workspaceMember.findMany({
            where: { workspaceId, role: "ADMIN" },
            select: { userId: true }
        });

        const adminIds = admins.map(admin => admin.userId);

        if (adminIds.length > 0) {
            await createNotification({
                userIds: adminIds,
                actorId: userId,
                workspaceId: workspaceId,
                entityId: workspaceId,
                entityType: "WORKSPACE",
                action: "ASSIGNED", 
                title: "New Member Joined",
                message: `joined the workspace "${workspace.name}"`
            });
        }

        eventEmitter.emit('invalidate');

        return { success: "Joined workspace successfully!", data: workspace };

    } catch (error: any) {
        return { error: error.message || "Failed to join workspace" };
    }
}