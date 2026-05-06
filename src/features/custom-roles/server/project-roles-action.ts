"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { revalidatePath } from "next/cache";
import { Permission } from "@prisma/client";
import { generateInviteCode } from "@/lib/utils";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";

async function verifyProjectAdminAccess(userId: string, projectId: string) {
    const projectMember = await prisma.projectMember.findFirst({
        where: { userId, projectId },
        include: { role: true }
    });

    const isProjectAdmin = projectMember?.role.permissions.includes(PERMISSIONS.PROJECT_MANAGE_ROLES as Permission);

    const workspaceMember = await prisma.workspaceMember.findFirst({
        where: {
            userId,
            workspace: { projects: { some: { id: projectId } } }
        },
        include: { role: true }
    });

    const isWorkspaceAdmin = workspaceMember?.role.permissions.includes(PERMISSIONS.WORKSPACE_MANAGE_ROLES as Permission) ||
        workspaceMember?.role.permissions.includes(PERMISSIONS.WORKSPACE_UPDATE as Permission);

    if (!isProjectAdmin && !isWorkspaceAdmin) {
        throw new Error("Unauthorized: You do not have permission to manage roles for this project.");
    }
}

export async function getProjectRolesAction(projectId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const roles = await prisma.customRole.findMany({
            where: { projectId },
            orderBy: { createdAt: 'asc' }
        });

        return { data: roles };
    } catch (error: any) {
        return { error: error.message || "Failed to fetch project roles" };
    }
}

export async function createProjectRoleAction(values: { name: string, workspaceId: string, projectId: string, permissions: string[] }) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        await verifyProjectAdminAccess(session.user.id, values.projectId);

        const newRole = await prisma.customRole.create({
            data: {
                name: values.name,
                workspaceId: values.workspaceId,
                projectId: values.projectId,
                permissions: values.permissions as Permission[], 
                isSystem: false,
                inviteCode: generateInviteCode(10)
            }
        });

        await createAuditLog({
            workspaceId: values.workspaceId,
            projectId: values.projectId,
            entityId: newRole.id,
            entityType: ENTITY_TYPE.PROJECT,
            action: ACTION.CREATE,
            metadata: {
                message: `created a new project role "${newRole.name}"`
            }
        });

        revalidatePath(`/workspaces/${values.workspaceId}/projects/${values.projectId}/settings`);
        return { success: "Project role created successfully", data: newRole };
    } catch (error: any) {
        return { error: error.message || "Failed to create project role" };
    }
}

export async function updateProjectRoleAction(values: { id: string, name: string, workspaceId: string, projectId: string, permissions: string[] }) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        await verifyProjectAdminAccess(session.user.id, values.projectId);

        const existingRole = await prisma.customRole.findUnique({ where: { id: values.id } });
        if (!existingRole) throw new Error("Role not found");

        if (existingRole.isSystem) {
            throw new Error("System default roles cannot be modified.");
        }

        const updatedRole = await prisma.customRole.update({
            where: { id: values.id },
            data: {
                name: values.name,
                permissions: values.permissions as Permission[],
            }
        });

        await createAuditLog({
            workspaceId: values.workspaceId,
            projectId: values.projectId,
            entityId: updatedRole.id,
            entityType: ENTITY_TYPE.PROJECT,
            action: ACTION.UPDATE,
            metadata: {
                message: `updated permissions for project role "${updatedRole.name}"`
            }
        });

        revalidatePath(`/workspaces/${values.workspaceId}/projects/${values.projectId}/settings`);
        return { success: "Project role updated successfully", data: updatedRole };
    } catch (error: any) {
        return { error: error.message || "Failed to update project role" };
    }
}

export async function deleteProjectRoleAction(roleId: string, projectId: string, workspaceId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        await verifyProjectAdminAccess(session.user.id, projectId);

        const role = await prisma.customRole.findUnique({
            where: { id: roleId },
            include: { projectMembers: true }
        });

        if (!role) throw new Error("Role not found");
        if (role.isSystem) throw new Error("System roles cannot be deleted.");
        if (role.isProjectDefault) throw new Error("The default project role cannot be deleted.");

        if (role.projectMembers.length > 0) {
            throw new Error("Cannot delete role. It is currently assigned to active project members.");
        }

        await prisma.customRole.delete({ where: { id: roleId } });

        await createAuditLog({
            workspaceId: workspaceId,
            projectId: projectId,
            entityId: roleId,
            entityType: ENTITY_TYPE.PROJECT,
            action: ACTION.DELETE,
            metadata: {
                message: `deleted project role "${role.name}"`
            }
        });

        revalidatePath(`/workspaces/${workspaceId}/projects/${projectId}/settings`);
        return { success: "Project role deleted successfully" };
    } catch (error: any) {
        return { error: error.message || "Failed to delete project role" };
    }
}

export async function resetProjectRoleInviteCodeAction(roleId: string, projectId: string, workspaceId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        await verifyProjectAdminAccess(session.user.id, projectId);

        const updatedRole = await prisma.customRole.update({
            where: { id: roleId },
            data: { inviteCode: generateInviteCode(10) }
        });

        await createAuditLog({
            workspaceId: workspaceId,
            projectId: projectId,
            entityId: roleId,
            entityType: ENTITY_TYPE.PROJECT,
            action: ACTION.UPDATE,
            metadata: {
                message: `reset the invite link for project role "${updatedRole.name}"`
            }
        });

        revalidatePath(`/workspaces/${workspaceId}/projects/${projectId}/settings`);
        return { success: "Invite link reset successfully", data: updatedRole };
    } catch (error: any) {
        return { error: error.message || "Failed to reset invite link" };
    }
}