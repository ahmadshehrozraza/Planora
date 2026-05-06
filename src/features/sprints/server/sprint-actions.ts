"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { SprintStatus } from "@prisma/client";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";
import { PERMISSIONS } from "@/lib/permissions-constants";

async function verifySprintAccess(sprintId: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });
    if (!user) throw new Error("User not found");

    const sprint = await prisma.sprint.findUnique({
        where: { id: sprintId },
        include: {
            project: { select: { workspaceId: true, name: true } }
        }
    });

    if (!sprint) throw new Error("Sprint not found");

    const isProjectManager = await prisma.projectMember.findFirst({
        where: {
            userId: user.id,
            projectId: sprint.projectId,
            role: { permissions: { has: PERMISSIONS.PROJECT_MANAGE_MEMBERS } }
        }
    });

    const isWorkspaceAdmin = await prisma.workspaceMember.findFirst({
        where: {
            userId: user.id,
            workspaceId: sprint.project.workspaceId,
            role: { permissions: { has: PERMISSIONS.WORKSPACE_UPDATE } }
        }
    });

    if (!isProjectManager && !isWorkspaceAdmin) {
        throw new Error("Only Project Managers or Workspace Admins can perform this action");
    }

    return { sprint, userId: user.id };
}

export async function updateSprintAction(sprintId: string, values: any) {
    try {
        const { sprint: oldSprint, userId } = await verifySprintAccess(sprintId);

        const updatedSprint = await prisma.sprint.update({
            where: { id: sprintId },
            data: {
                name: values.name,
                goal: values.goal,
                description: values.description,
                status: values.status as SprintStatus,
                startDate: values.startDate ? new Date(values.startDate) : null,
                dueDate: values.dueDate ? new Date(values.dueDate) : null,
            }
        });

        let changes = [];
        if (oldSprint.name !== updatedSprint.name) changes.push(`renamed sprint to "${updatedSprint.name}"`);
        if (oldSprint.status !== updatedSprint.status) changes.push(`changed sprint status to ${updatedSprint.status}`);

        if (changes.length > 0) {
            const logMessage = changes.join(" and ");

            await createAuditLog({
                workspaceId: oldSprint.project.workspaceId,
                projectId: updatedSprint.projectId,
                entityId: updatedSprint.id,
                entityType: ENTITY_TYPE.SPRINT,
                action: ACTION.UPDATE,
                metadata: {
                    title: updatedSprint.name,
                    message: logMessage
                }
            });

            const projectMembers = await prisma.projectMember.findMany({
                where: { projectId: updatedSprint.projectId },
                select: { userId: true }
            });

            const userIdsToNotify = projectMembers.map(m => m.userId);

            if (userIdsToNotify.length > 0) {
                await createNotification({
                    userIds: userIdsToNotify,
                    actorId: userId,
                    workspaceId: oldSprint.project.workspaceId,
                    projectId: updatedSprint.projectId,
                    entityId: updatedSprint.projectId, 
                    entityType: "PROJECT",
                    action: "UPDATED",
                    title: "Sprint Updated",
                    message: logMessage
                });
            }
        }

        eventEmitter.emit('invalidate');

        return { success: "Sprint updated successfully", data: updatedSprint };
    } catch (error: any) {
        return { error: error.message || "Failed to update sprint" };
    }
}

export async function deleteSprintAction(sprintId: string) {
    try {
        const { sprint, userId } = await verifySprintAccess(sprintId);

        const deletedSprint = await prisma.sprint.delete({
            where: { id: sprintId }
        });

        await createAuditLog({
            workspaceId: sprint.project.workspaceId,
            projectId: deletedSprint.projectId,
            entityId: deletedSprint.id,
            entityType: ENTITY_TYPE.SPRINT,
            action: ACTION.DELETE,
            metadata: {
                title: deletedSprint.name,
                message: `Deleted the sprint "${deletedSprint.name}"`
            }
        });

        const projectMembers = await prisma.projectMember.findMany({
            where: { projectId: deletedSprint.projectId },
            select: { userId: true }
        });

        const userIdsToNotify = projectMembers.map(m => m.userId);

        if (userIdsToNotify.length > 0) {
            await createNotification({
                userIds: userIdsToNotify,
                actorId: userId,
                workspaceId: sprint.project.workspaceId,
                projectId: deletedSprint.projectId,
                entityId: deletedSprint.projectId,
                entityType: "PROJECT",
                action: "UPDATED",
                title: "Sprint Deleted",
                message: `deleted the sprint "${deletedSprint.name}"`
            });
        }

        eventEmitter.emit('invalidate');

        return { success: "Sprint deleted successfully" };
    } catch (error: any) {
        return { error: error.message || "Failed to delete sprint" };
    }
}