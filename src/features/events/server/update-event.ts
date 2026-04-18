"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createEventSchema } from "../schemas";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { format } from "date-fns";
import { eventEmitter } from "@/lib/event-emitter";

export async function updateEventAction({ eventId, values }: { eventId: string, values: z.infer<typeof createEventSchema> }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        if (!eventId) throw new Error("Event ID is required");

        const oldEvent = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!oldEvent) throw new Error("Event not found");

        const validatedData = createEventSchema.parse(values);

        const projectIdToSave = (!validatedData.projectId || validatedData.projectId === "none") ? null : validatedData.projectId;
        const segmentIdToSave = (!validatedData.segmentId || validatedData.segmentId === "none") ? null : validatedData.segmentId;

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: {
                title: validatedData.title,
                description: validatedData.description,
                date: validatedData.date,
                projectId: projectIdToSave,
                segmentId: segmentIdToSave,
            }
        });

        const changes: string[] = [];
        if (oldEvent.title !== updatedEvent.title) changes.push(`renamed event to "${updatedEvent.title}"`);
        if (oldEvent.date?.getTime() !== updatedEvent.date?.getTime()) {
            changes.push(`changed date to ${updatedEvent.date ? format(updatedEvent.date, "MMM d, yyyy") : "None"}`);
        }
        if (oldEvent.description !== updatedEvent.description) changes.push(`updated the description`);

        if (changes.length > 0) {
            const logMessage = changes.join(" and ");

            await createAuditLog({
                workspaceId: updatedEvent.workspaceId,
                projectId: updatedEvent.projectId,
                entityId: updatedEvent.id,
                entityType: ENTITY_TYPE.EVENT,
                action: ACTION.UPDATE,
                metadata: {
                    title: updatedEvent.title,
                    message: logMessage
                }
            });

            let userIdsToNotify: string[] = [];

            if (updatedEvent.projectId) {
                const projectMembers = await prisma.projectMember.findMany({
                    where: { projectId: updatedEvent.projectId },
                    select: { userId: true }
                });
                userIdsToNotify = projectMembers.map(m => m.userId);
            } else {
                const workspaceMembers = await prisma.workspaceMember.findMany({
                    where: { workspaceId: updatedEvent.workspaceId },
                    select: { userId: true }
                });
                userIdsToNotify = workspaceMembers.map(m => m.userId);
            }

            if (userIdsToNotify.length > 0) {
                await createNotification({
                    userIds: userIdsToNotify,
                    actorId: user.id,
                    workspaceId: updatedEvent.workspaceId,
                    projectId: updatedEvent.projectId,
                    entityId: updatedEvent.id,
                    entityType: "WORKSPACE",
                    action: "UPDATED",
                    title: "Event Updated",
                    message: logMessage
                });
            }
        }

        eventEmitter.emit('invalidate');

        return { success: true, data: updatedEvent };
    } catch (error: any) {
        return { error: error.message || "Failed to update event." };
    }
}