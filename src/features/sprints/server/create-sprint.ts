"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { SprintStatus } from "@prisma/client";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";
import { PERMISSIONS } from "@/lib/permissions-constants";

export async function createSprintAction(values: any) {
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
                role: { permissions: { has: PERMISSIONS.PROJECT_MANAGE_MEMBERS } }
            }
        });

        const isWorkspaceAdmin = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: user.id, workspaceId: values.workspaceId } },
            include: { role: true }
        });

        const hasAdminAccess = isWorkspaceAdmin?.role?.permissions.includes(PERMISSIONS.WORKSPACE_UPDATE);

        if (!isProjectManager && !hasAdminAccess) {
            throw new Error("Only Project Managers or Workspace Admins can create sprints");
        }

        const newSprint = await prisma.sprint.create({
            data: {
                name: values.name,
                goal: values.goal,
                description: values.description,
                status: values.status as SprintStatus,
                startDate: values.startDate ? new Date(values.startDate) : null,
                dueDate: values.dueDate ? new Date(values.dueDate) : null,
                projectId: values.projectId,
            }
        });

        await createAuditLog({
            workspaceId: values.workspaceId,
            projectId: newSprint.projectId,
            entityId: newSprint.id,
            entityType: ENTITY_TYPE.SPRINT,
            action: ACTION.CREATE,
            metadata: {
                title: newSprint.name,
                message: `Created a new sprint "${newSprint.name}"`
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
                title: "New Sprint",
                message: `created a new sprint "${newSprint.name}"`
            });
        }

        eventEmitter.emit('invalidate');

        return { success: "Sprint created successfully!", data: newSprint };

    } catch (error: any) {
        return { error: error.message || "Failed to create sprint" };
    }
}