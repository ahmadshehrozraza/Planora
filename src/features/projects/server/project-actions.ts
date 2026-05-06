"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";
import { PERMISSIONS } from "@/lib/permissions-constants";

async function verifyManagerOrAdmin(projectId: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });
    if (!user) throw new Error("User not found");

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error("Project not found");

    const isWorkspaceAdmin = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: user.id, workspaceId: project.workspaceId } },
        include: { role: true }
    });

    const isProjectManager = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: user.id, projectId: projectId } },
        include: { role: true }
    });

    if (
        (isWorkspaceAdmin && (isWorkspaceAdmin.role?.permissions?.includes(PERMISSIONS.WORKSPACE_UPDATE) || isWorkspaceAdmin.role?.permissions?.includes(PERMISSIONS.WORKSPACE_DELETE))) || 
        (isProjectManager && (isProjectManager.role?.permissions?.includes(PERMISSIONS.PROJECT_MANAGE_MEMBERS) || isProjectManager.role?.permissions?.includes(PERMISSIONS.PROJECT_UPDATE)))
    ) {
        return { userId: user.id, project };
    }

    throw new Error("Only Project Managers or Admins can perform this action");
}

export async function updateProjectAction(projectId: string, values: any) {
    try {
        const { userId, project: oldProject } = await verifyManagerOrAdmin(projectId);
        
        const updated = await prisma.project.update({
            where: { id: projectId },
            data: {
                name: values.name,
                description: values.description,
                status: values.status,
                currency: values.currency,
                budget: values.budget,
                startDate: values.startDate ? new Date(values.startDate) : null,
                dueDate: values.dueDate ? new Date(values.dueDate) : null,
                imageUrl: values.imageUrl,
                githubRepoUrl: values.githubRepoUrl || null,
            }
        });

        let changes = [];
        if (oldProject.name !== updated.name) changes.push(`renamed the project to "${updated.name}"`);
        if (oldProject.status !== updated.status) changes.push(`changed project status to ${updated.status}`);
        if (oldProject.githubRepoUrl !== updated.githubRepoUrl) changes.push(`updated the repository link`);

        if (changes.length > 0) {
            const logMessage = changes.join(" and ");

            await createAuditLog({
                workspaceId: updated.workspaceId,
                projectId: updated.id,
                entityId: updated.id,
                entityType: ENTITY_TYPE.PROJECT,
                action: ACTION.UPDATE,
                metadata: {
                    title: updated.name,
                    message: logMessage
                }
            });

            const projectMembers = await prisma.projectMember.findMany({
                where: { projectId },
                select: { userId: true }
            });

            const userIdsToNotify = projectMembers.map(m => m.userId);

            if (userIdsToNotify.length > 0) {
                await createNotification({
                    userIds: userIdsToNotify,
                    actorId: userId,
                    workspaceId: updated.workspaceId,
                    projectId: updated.id,
                    entityId: updated.id,
                    entityType: "PROJECT",
                    action: "UPDATED",
                    title: "Project Updated",
                    message: logMessage
                });
            }
        }

        eventEmitter.emit('invalidate');

        return { success: "Project updated!", data: updated };
    } catch (error: any) {
        return { error: error.message || "Failed to update project" };
    }
}

export async function deleteProjectAction(projectId: string) {
    try {
        await verifyManagerOrAdmin(projectId);
        
        await prisma.project.delete({ 
            where: { id: projectId } 
        });

        eventEmitter.emit('invalidate');

        return { success: "Project deleted!" };
    } catch (error: any) {
        return { error: error.message || "Failed to delete project" };
    }
}