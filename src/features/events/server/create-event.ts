"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createEventSchema } from "../schemas"; 
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";

export async function createEventAction(values: z.infer<typeof createEventSchema>) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({ 
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) throw new Error("User not found");

        const validatedData = createEventSchema.parse(values);

        const projectId = validatedData.projectId === "none" ? null : validatedData.projectId;
        const segmentId = validatedData.segmentId === "none" ? null : validatedData.segmentId;

        const newEvent = await prisma.event.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                date: validatedData.date,
                workspaceId: validatedData.workspaceId,
                projectId: projectId,
                segmentId: segmentId,
                creatorId: user.id
            }
        });

        await createAuditLog({
            workspaceId: newEvent.workspaceId,
            projectId: newEvent.projectId,
            entityId: newEvent.id,
            entityType: ENTITY_TYPE.EVENT,
            action: ACTION.CREATE,
            metadata: {
                title: newEvent.title,
                message: `created the event "${newEvent.title}"`
            }
        });

        let userIdsToNotify: string[] = [];

        if (newEvent.projectId) {
            const projectMembers = await prisma.projectMember.findMany({
                where: { projectId: newEvent.projectId },
                select: { userId: true }
            });
            userIdsToNotify = projectMembers.map(m => m.userId);
        } else {
            const workspaceMembers = await prisma.workspaceMember.findMany({
                where: { workspaceId: newEvent.workspaceId },
                select: { userId: true }
            });
            userIdsToNotify = workspaceMembers.map(m => m.userId);
        }

        if (userIdsToNotify.length > 0) {
            await createNotification({
                userIds: userIdsToNotify,
                actorId: user.id,
                workspaceId: newEvent.workspaceId,
                projectId: newEvent.projectId,
                entityId: newEvent.id,
                entityType: "WORKSPACE",
                action: "CREATED",
                title: "New Event",
                message: `scheduled a new event "${newEvent.title}"`
            });
        }

        eventEmitter.emit('invalidate');

        return { success: true, data: newEvent };

    } catch (error: any) {
        return { error: error.message || "Failed to create event." };
    }
}