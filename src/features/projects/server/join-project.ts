"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";
import { PERMISSIONS } from "@/lib/permissions-constants";

export async function joinProjectAction({ 
    projectId, 
    workspaceId, 
    inviteCode,
    roleToken
}: { 
    projectId: string, 
    workspaceId: string, 
    inviteCode: string,
    roleToken?: string
}) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true }
        });
        
        if (!user) throw new Error("User not found");

        const project = await prisma.project.findUnique({
            where: { id: projectId, workspaceId }
        });

        if (!project || project.inviteCode !== inviteCode) {
            throw new Error("Invalid invite link or project not found");
        }

        let projectRoleToAssignId: string | null = null;

        if (roleToken) {
            const specificProjectRole = await prisma.customRole.findFirst({
                where: { projectId, inviteCode: roleToken }
            });
            if (!specificProjectRole) throw new Error("Invalid or expired role token");
            projectRoleToAssignId = specificProjectRole.id;
        } else {
            const defaultProjectRole = await prisma.customRole.findFirst({
                where: { projectId, isProjectDefault: true }
            });
            if (!defaultProjectRole) throw new Error("Critical Error: Default role not configured for this project.");
            projectRoleToAssignId = defaultProjectRole.id;
        }

        const existingWorkspaceMember = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: user.id, workspaceId } }
        });

        if (!existingWorkspaceMember) {
            const defaultWorkspaceRole = await prisma.customRole.findFirst({
                where: { workspaceId, isWorkspaceDefault: true }
            });
            if (!defaultWorkspaceRole) throw new Error("Critical Error: Default workspace role missing.");
            
            await prisma.workspaceMember.create({
                data: { userId: user.id, workspaceId, roleId: defaultWorkspaceRole.id }
            });
        }

        const existingProjectMember = await prisma.projectMember.findUnique({
            where: { userId_projectId: { userId: user.id, projectId } }
        });

        if (existingProjectMember) {
            return { success: true, message: "You are already a member of this project." };
        }

        const newMember = await prisma.projectMember.create({
            data: { userId: user.id, projectId, roleId: projectRoleToAssignId }
        });

        await createAuditLog({
            workspaceId: workspaceId,
            projectId: projectId,
            entityId: newMember.id,
            entityType: ENTITY_TYPE.MEMBER,
            action: ACTION.CREATE,
            metadata: {
                message: `Joined the project via invite link`
            }
        });

        const projectManagers = await prisma.projectMember.findMany({
            where: {
                projectId,
                role: { permissions: { has: PERMISSIONS.PROJECT_MANAGE_MEMBERS } }
            },
            select: { userId: true }
        });

        const managerIds = projectManagers.map(pm => pm.userId);

        if (managerIds.length > 0) {
            await createNotification({
                userIds: managerIds,
                actorId: user.id,
                workspaceId: workspaceId,
                projectId: projectId,
                entityId: projectId,
                entityType: "PROJECT",
                action: "ASSIGNED",
                title: "New Team Member",
                message: `joined the project "${project.name}"`
            });
        }

        eventEmitter.emit('invalidate');

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to join project" };
    }
}