"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";

export async function updateMemberAction({ memberId, roleId }: { memberId: string, roleId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!currentUser) throw new Error("User not found");

        const memberToUpdate = await prisma.workspaceMember.findUnique({ 
            where: { id: memberId },
            include: { role: true }
        });
        if (!memberToUpdate) throw new Error("Member not found");

        const currentMember = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: currentUser.id, workspaceId: memberToUpdate.workspaceId } },
            include: { role: true }
        });

        if (!currentMember || !currentMember.role?.permissions.includes("WORKSPACE_MANAGE_ROLES")) {
            throw new Error("Only admins can update roles");
        }

        const newRole = await prisma.customRole.findUnique({ where: { id: roleId } });
        if (!newRole) throw new Error("Role not found");

        const wasOwner = memberToUpdate.role?.permissions.includes("WORKSPACE_DELETE");
        const willBeOwner = newRole.permissions.includes("WORKSPACE_DELETE");

        if (wasOwner && !willBeOwner) {
            const allMembers = await prisma.workspaceMember.findMany({
                where: { workspaceId: memberToUpdate.workspaceId },
                include: { role: true }
            });
            const ownerCount = allMembers.filter(m => m.role?.permissions.includes("WORKSPACE_DELETE")).length;
            
            if (ownerCount <= 1) throw new Error("Cannot downgrade the last Owner. Transfer ownership first.");
        }

        const updated = await prisma.workspaceMember.update({
            where: { id: memberId },
            data: { roleId },
            include: { 
                user: { select: { name: true } },
                workspace: { select: { name: true } },
                role: true
            }
        });

        await createAuditLog({
            workspaceId: updated.workspaceId,
            entityId: updated.id,
            entityType: ENTITY_TYPE.MEMBER,
            action: ACTION.UPDATE,
            metadata: {
                message: `Updated role for ${updated.user.name || "member"} to ${updated.role.name}`
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
            message: `changed your role to ${updated.role.name} in workspace "${updated.workspace.name}"`
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
                workspace: { select: { name: true } },
                role: true
            }
        });
        if (!memberToDelete) throw new Error("Member not found");

        const currentMember = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: currentUser.id, workspaceId: memberToDelete.workspaceId } },
            include: { role: true }
        });

        if (!currentMember) throw new Error("Unauthorized");

        if (!currentMember.role?.permissions.includes("WORKSPACE_MANAGE_MEMBERS") && currentMember.id !== memberId) {
            throw new Error("Only admins can remove other members");
        }

        if (memberToDelete.role?.permissions.includes("WORKSPACE_DELETE")) {
            const allMembers = await prisma.workspaceMember.findMany({
                where: { workspaceId: memberToDelete.workspaceId },
                include: { role: true }
            });
            const ownerCount = allMembers.filter(m => m.role?.permissions.includes("WORKSPACE_DELETE")).length;
            
            if (ownerCount <= 1) throw new Error("Cannot remove the last Owner. Transfer ownership first.");
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