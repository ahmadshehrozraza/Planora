"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { generateInviteCode } from "@/lib/utils";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { eventEmitter } from "@/lib/event-emitter";
import { PERMISSIONS } from "@/lib/permissions-constants";

export async function resetProjectInviteCodeAction({ projectId }: { projectId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) throw new Error("Project not found");

        const isWorkspaceAdmin = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: user.id, workspaceId: project.workspaceId } },
            include: { role: true }
        });

        const isProjectAdmin = await prisma.projectMember.findUnique({
            where: { userId_projectId: { userId: user.id, projectId: projectId } },
            include: { role: true }
        });

        const isAuthorized = 
            isWorkspaceAdmin?.role?.permissions?.includes(PERMISSIONS.WORKSPACE_UPDATE) || isWorkspaceAdmin?.role?.permissions?.includes(PERMISSIONS.WORKSPACE_DELETE) || 
            isProjectAdmin?.role?.permissions?.includes(PERMISSIONS.PROJECT_MANAGE_MEMBERS) || isProjectAdmin?.role?.permissions?.includes(PERMISSIONS.PROJECT_UPDATE);

        if (!isAuthorized) {
            throw new Error("You don't have permission to reset the invite code");
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: { inviteCode: generateInviteCode(10) }
        });

        await createAuditLog({
            workspaceId: updatedProject.workspaceId,
            projectId: updatedProject.id,
            entityId: updatedProject.id,
            entityType: ENTITY_TYPE.PROJECT,
            action: ACTION.UPDATE,
            metadata: {
                message: `Reset the invite code for project "${updatedProject.name}"`
            }
        });

        eventEmitter.emit('invalidate');

        return { success: true, data: updatedProject };
    } catch (error: any) {
        return { error: error.message || "Failed to reset invite code" };
    }
}