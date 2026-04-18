"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";

export async function deleteProjectMemberAction({ memberId }: { memberId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!currentUser) throw new Error("User not found");

        const memberToDelete = await prisma.projectMember.findUnique({
            where: { id: memberId },
            include: {
                project: true,
                user: { select: { name: true } }
            }
        });

        if (!memberToDelete) throw new Error("Member not found");

        await prisma.projectMember.delete({
            where: { id: memberId }
        });

        await createAuditLog({
            workspaceId: memberToDelete.project.workspaceId,
            projectId: memberToDelete.projectId,
            entityId: memberId,
            entityType: ENTITY_TYPE.MEMBER,
            action: ACTION.DELETE,
            metadata: {
                message: `Removed member ${memberToDelete.user?.name || ""} from the project`
            }
        });

        await createNotification({
            userIds: [memberToDelete.userId],
            actorId: currentUser.id,
            workspaceId: memberToDelete.project.workspaceId,
            projectId: memberToDelete.projectId,
            entityId: memberToDelete.projectId,
            entityType: "PROJECT",
            action: "UPDATED",
            title: "Removed from Project",
            message: `removed you from the project "${memberToDelete.project.name}"`
        });

        eventEmitter.emit('invalidate');

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to remove member" };
    }
}