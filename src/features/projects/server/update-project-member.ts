"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";
import { getPermissions } from "@/lib/get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";

export async function updateProjectMemberAction({ memberId, roleId, projectId }: { memberId: string, roleId: string, projectId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!currentUser) throw new Error("User not found");

        const existingMember = await prisma.projectMember.findUnique({
            where: { id: memberId },
            include: { project: true }
        });
        if (!existingMember) throw new Error("Member not found");

        const userPermissions = await getPermissions({ 
            workspaceId: existingMember.project.workspaceId, 
            projectId: existingMember.projectId 
        });

        const isWorkspaceOwner = userPermissions.includes(PERMISSIONS.WORKSPACE_DELETE);
        const canManageRoles = userPermissions.includes(PERMISSIONS.PROJECT_MANAGE_ROLES) || userPermissions.includes(PERMISSIONS.PROJECT_UPDATE);

        if (!isWorkspaceOwner && !canManageRoles) {
            throw new Error("Unauthorized: You do not have permission to manage project roles.");
        }


        const newRole = await prisma.customRole.findUnique({
            where: { id: roleId }
        });
        if (!newRole) throw new Error("Role not found");

        const updatedMember = await prisma.projectMember.update({
            where: { id: memberId },
            data: { roleId },
            include: {
                project: true,
                user: { select: { name: true } }
            }
        });

        await createAuditLog({
            workspaceId: updatedMember.project.workspaceId,
            projectId: updatedMember.projectId,
            entityId: updatedMember.id,
            entityType: ENTITY_TYPE.MEMBER,
            action: ACTION.UPDATE,
            metadata: {
                message: `Updated role for ${updatedMember.user?.name || "member"} to ${newRole.name}`
            }
        });

        await createNotification({
            userIds: [updatedMember.userId],
            actorId: currentUser.id,
            workspaceId: updatedMember.project.workspaceId,
            projectId: updatedMember.projectId,
            entityId: updatedMember.projectId,
            entityType: "PROJECT",
            action: "UPDATED",
            title: "Role Updated",
            message: `changed your role to ${newRole.name} in project "${updatedMember.project.name}"`
        });

        eventEmitter.emit('invalidate');

        return { success: true, data: updatedMember };
    } catch (error: any) {
        return { error: error.message || "Failed to update member role" };
    }
}