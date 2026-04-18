"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { SegmentStatus } from "@prisma/client";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";

export async function createSegmentAction(values: any) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const isProjectManager = await prisma.projectMember.findFirst({
            where: { 
                userId: user.id, 
                projectId: values.projectId,
                role: { in: ["PROJECT_MANAGER"] }
            }
        });

        const isWorkspaceAdmin = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: user.id, workspaceId: values.workspaceId } }
        });

        if (!isProjectManager && (!isWorkspaceAdmin || isWorkspaceAdmin.role !== "ADMIN")) {
            throw new Error("Only Project Managers or Workspace Admins can create segments");
        }

        const newSegment = await prisma.segment.create({
            data: {
                name: values.name,
                description: values.description,
                status: values.status as SegmentStatus,
                startDate: values.startDate ? new Date(values.startDate) : null,
                dueDate: values.dueDate ? new Date(values.dueDate) : null,
                projectId: values.projectId,
            }
        });

        await createAuditLog({
            workspaceId: values.workspaceId,
            projectId: newSegment.projectId,
            entityId: newSegment.id,
            entityType: ENTITY_TYPE.SEGMENT,
            action: ACTION.CREATE,
            metadata: {
                title: newSegment.name,
                message: `Created a new segment "${newSegment.name}"`
            }
        });

        const projectMembers = await prisma.projectMember.findMany({
            where: { projectId: values.projectId },
            select: { userId: true }
        });

        const userIdsToNotify = projectMembers.map(m => m.userId);

        if (userIdsToNotify.length > 0) {
            await createNotification({
                userIds: userIdsToNotify,
                actorId: user.id,
                workspaceId: values.workspaceId,
                projectId: values.projectId,
                entityId: values.projectId, 
                entityType: "PROJECT",
                action: "CREATED",
                title: "New Segment",
                message: `created a new segment "${newSegment.name}"`
            });
        }

        eventEmitter.emit('invalidate');

        return { success: "Segment created successfully!", data: newSegment };

    } catch (error: any) {
        return { error: error.message || "Failed to create segment" };
    }
}