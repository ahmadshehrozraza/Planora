"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";

export async function updateProjectMemberAction({ memberId, role }: { memberId: string, role: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!currentUser) throw new Error("User not found");

        const updatedMember = await prisma.projectMember.update({
            where: { id: memberId },
            data: { role: role as any },
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
                message: `Updated role for ${updatedMember.user?.name || "member"} to ${role}`
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
            message: `changed your role to ${role} in project "${updatedMember.project.name}"`
        });

        eventEmitter.emit('invalidate');

        return { success: true, data: updatedMember };
    } catch (error: any) {
        return { error: error.message || "Failed to update member role" };
    }
}