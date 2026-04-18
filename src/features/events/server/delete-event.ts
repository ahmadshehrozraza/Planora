"use server";

import { auth } from "@/auth/auth";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";

export async function deleteEventAction({ eventId }: { eventId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        if (!eventId) throw new Error("Event ID is required");

        const eventToDelete = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!eventToDelete) throw new Error("Event not found");

        await prisma.event.delete({
            where: { id: eventId }
        });

        await createAuditLog({
            workspaceId: eventToDelete.workspaceId,
            projectId: eventToDelete.projectId,
            entityId: eventId,
            entityType: ENTITY_TYPE.EVENT,
            action: ACTION.DELETE,
            metadata: {
                title: eventToDelete.title,
                message: `deleted the event "${eventToDelete.title}"`
            }
        });

        const isFutureEvent = eventToDelete.date && new Date(eventToDelete.date) > new Date();

        if (isFutureEvent) {
            let userIdsToNotify: string[] = [];

            if (eventToDelete.projectId) {
                const projectMembers = await prisma.projectMember.findMany({
                    where: { projectId: eventToDelete.projectId },
                    select: { userId: true }
                });
                userIdsToNotify = projectMembers.map(m => m.userId);
            } else {
                const workspaceMembers = await prisma.workspaceMember.findMany({
                    where: { workspaceId: eventToDelete.workspaceId },
                    select: { userId: true }
                });
                userIdsToNotify = workspaceMembers.map(m => m.userId);
            }

            if (userIdsToNotify.length > 0) {
                await createNotification({
                    userIds: userIdsToNotify,
                    actorId: user.id,
                    workspaceId: eventToDelete.workspaceId,
                    projectId: eventToDelete.projectId,
                    entityId: eventToDelete.workspaceId,
                    entityType: "WORKSPACE",
                    action: "UPDATED",
                    title: "Event Canceled",
                    message: `canceled the upcoming event "${eventToDelete.title}"`
                });
            }
        }

        eventEmitter.emit('invalidate');

        return { success: true };

    } catch (error: any) {
        return { error: error.message || "Failed to delete event." };
    }
}