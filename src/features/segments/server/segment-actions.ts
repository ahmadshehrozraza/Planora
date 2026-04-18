"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { SegmentStatus } from "@prisma/client";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";

async function verifySegmentAccess(segmentId: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });
    if (!user) throw new Error("User not found");

    const segment = await prisma.segment.findUnique({
        where: { id: segmentId },
        include: {
            project: { select: { workspaceId: true, name: true } }
        }
    });

    if (!segment) throw new Error("Segment not found");

    const isProjectManager = await prisma.projectMember.findFirst({
        where: {
            userId: user.id,
            projectId: segment.projectId,
            role: { in: ["PROJECT_MANAGER"] }
        }
    });

    const isWorkspaceAdmin = await prisma.workspaceMember.findFirst({
        where: {
            userId: user.id,
            workspaceId: segment.project.workspaceId,
            role: "ADMIN"
        }
    });

    if (!isProjectManager && !isWorkspaceAdmin) {
        throw new Error("Only Project Managers or Workspace Admins can perform this action");
    }

    return { segment, userId: user.id };
}

export async function updateSegmentAction(segmentId: string, values: any) {
    try {
        const { segment: oldSegment, userId } = await verifySegmentAccess(segmentId);

        const updatedSegment = await prisma.segment.update({
            where: { id: segmentId },
            data: {
                name: values.name,
                description: values.description,
                status: values.status as SegmentStatus,
                startDate: values.startDate ? new Date(values.startDate) : null,
                dueDate: values.dueDate ? new Date(values.dueDate) : null,
            }
        });

        let changes = [];
        if (oldSegment.name !== updatedSegment.name) changes.push(`renamed segment to "${updatedSegment.name}"`);
        if (oldSegment.status !== updatedSegment.status) changes.push(`changed segment status to ${updatedSegment.status}`);

        if (changes.length > 0) {
            const logMessage = changes.join(" and ");

            await createAuditLog({
                workspaceId: oldSegment.project.workspaceId,
                projectId: updatedSegment.projectId,
                entityId: updatedSegment.id,
                entityType: ENTITY_TYPE.SEGMENT,
                action: ACTION.UPDATE,
                metadata: {
                    title: updatedSegment.name,
                    message: logMessage
                }
            });

            const projectMembers = await prisma.projectMember.findMany({
                where: { projectId: updatedSegment.projectId },
                select: { userId: true }
            });

            const userIdsToNotify = projectMembers.map(m => m.userId);

            if (userIdsToNotify.length > 0) {
                await createNotification({
                    userIds: userIdsToNotify,
                    actorId: userId,
                    workspaceId: oldSegment.project.workspaceId,
                    projectId: updatedSegment.projectId,
                    entityId: updatedSegment.projectId, 
                    entityType: "PROJECT",
                    action: "UPDATED",
                    title: "Segment Updated",
                    message: logMessage
                });
            }
        }

        eventEmitter.emit('invalidate');

        return { success: "Segment updated successfully", data: updatedSegment };
    } catch (error: any) {
        return { error: error.message || "Failed to update segment" };
    }
}

export async function deleteSegmentAction(segmentId: string) {
    try {
        const { segment, userId } = await verifySegmentAccess(segmentId);

        const deletedSegment = await prisma.segment.delete({
            where: { id: segmentId }
        });

        await createAuditLog({
            workspaceId: segment.project.workspaceId,
            projectId: deletedSegment.projectId,
            entityId: deletedSegment.id,
            entityType: ENTITY_TYPE.SEGMENT,
            action: ACTION.DELETE,
            metadata: {
                title: deletedSegment.name,
                message: `Deleted the segment "${deletedSegment.name}"`
            }
        });

        const projectMembers = await prisma.projectMember.findMany({
            where: { projectId: deletedSegment.projectId },
            select: { userId: true }
        });

        const userIdsToNotify = projectMembers.map(m => m.userId);

        if (userIdsToNotify.length > 0) {
            await createNotification({
                userIds: userIdsToNotify,
                actorId: userId,
                workspaceId: segment.project.workspaceId,
                projectId: deletedSegment.projectId,
                entityId: deletedSegment.projectId,
                entityType: "PROJECT",
                action: "UPDATED",
                title: "Segment Deleted",
                message: `deleted the segment "${deletedSegment.name}"`
            });
        }

        eventEmitter.emit('invalidate');

        return { success: "Segment deleted successfully" };
    } catch (error: any) {
        return { error: error.message || "Failed to delete segment" };
    }
}