"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";

export async function updateMemberAction({ memberId, role }: { memberId: string, role: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!currentUser) throw new Error("User not found");

        const memberToUpdate = await prisma.workspaceMember.findUnique({ 
            where: { id: memberId } 
        });
        if (!memberToUpdate) throw new Error("Member not found");

        const currentMember = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: currentUser.id, workspaceId: memberToUpdate.workspaceId } }
        });

        if (!currentMember || currentMember.role !== "ADMIN") {
            throw new Error("Only admins can update roles");
        }

        if (memberToUpdate.role === "ADMIN" && role === "MEMBER") {
            const adminCount = await prisma.workspaceMember.count({
                where: { workspaceId: memberToUpdate.workspaceId, role: "ADMIN" }
            });
            if (adminCount === 1) throw new Error("Cannot downgrade the last admin");
        }

        const updated = await prisma.workspaceMember.update({
            where: { id: memberId },
            data: { role: role as "ADMIN" | "MEMBER" },
            include: { 
                user: { select: { name: true } },
                workspace: { select: { name: true } }
            }
        });

        await createAuditLog({
            workspaceId: updated.workspaceId,
            entityId: updated.id,
            entityType: ENTITY_TYPE.MEMBER,
            action: ACTION.UPDATE,
            metadata: {
                message: `Updated role for ${updated.user.name || "member"} to ${updated.role}`
            }
        });

        await createNotification({
            userIds: [memberToUpdate.userId],
            actorId: currentUser.id,
            workspaceId: updated.workspaceId,
            entityId: updated.workspaceId,
            entityType: "WORKSPACE",
            action: "UPDATED",
            title: "Workspace Role Updated",
            message: `changed your role to ${role} in workspace "${updated.workspace.name}"`
        });

        eventEmitter.emit('invalidate');

        return { success: "Role updated successfully", data: updated };
    } catch (error: any) {
        return { error: error.message || "Failed to update member" };
    }
}

export async function deleteMemberAction({ memberId }: { memberId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!currentUser) throw new Error("User not found");

        const memberToDelete = await prisma.workspaceMember.findUnique({ 
            where: { id: memberId },
            include: { 
                user: { select: { name: true } },
                workspace: { select: { name: true } }
            }
        });
        if (!memberToDelete) throw new Error("Member not found");

        const currentMember = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: currentUser.id, workspaceId: memberToDelete.workspaceId } }
        });

        if (!currentMember) throw new Error("Unauthorized");

        if (currentMember.role !== "ADMIN" && currentMember.id !== memberId) {
            throw new Error("Only admins can remove other members");
        }

        if (memberToDelete.role === "ADMIN") {
            const adminCount = await prisma.workspaceMember.count({
                where: { workspaceId: memberToDelete.workspaceId, role: "ADMIN" }
            });
            if (adminCount === 1) throw new Error("Cannot remove the last admin");
        }

        await prisma.workspaceMember.delete({ where: { id: memberId } });
        
        await createAuditLog({
            workspaceId: memberToDelete.workspaceId,
            entityId: memberToDelete.id,
            entityType: ENTITY_TYPE.MEMBER,
            action: ACTION.DELETE,
            metadata: {
                message: `Removed ${memberToDelete.user.name || "member"} from the workspace`
            }
        });

        if (currentMember.id !== memberId) {
            await createNotification({
                userIds: [memberToDelete.userId],
                actorId: currentUser.id,
                workspaceId: memberToDelete.workspaceId,
                entityId: memberToDelete.workspaceId,
                entityType: "WORKSPACE",
                action: "UPDATED",
                title: "Removed from Workspace",
                message: `removed you from the workspace "${memberToDelete.workspace.name}"`
            });
        }

        eventEmitter.emit('invalidate');

        return { success: "Member removed successfully" };
    } catch (error: any) {
        return { error: error.message || "Failed to remove member" };
    }
}