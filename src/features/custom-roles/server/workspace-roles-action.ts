"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { revalidatePath } from "next/cache";
import { Permission } from "@prisma/client";
import { generateInviteCode } from "@/lib/utils";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";

async function verifyAdminAccess(userId: string, workspaceId: string) {
    const member = await prisma.workspaceMember.findFirst({
        where: { userId, workspaceId },
        include: { role: true }
    });

    if (!member || !member.role.permissions.includes(PERMISSIONS.WORKSPACE_MANAGE_ROLES as Permission)) {
        throw new Error("Unauthorized: You do not have permission to manage workspace roles.");
    }
}

export async function getWorkspaceRolesAction(workspaceId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const roles = await prisma.customRole.findMany({
            where: { 
                workspaceId,
                projectId: null 
            },
            orderBy: { createdAt: 'asc' }
        });

        return { data: roles };
    } catch (error: any) {
        return { error: error.message || "Failed to fetch roles" };
    }
}

export async function createWorkspaceRoleAction(values: { name: string, workspaceId: string, permissions: string[] }) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        await verifyAdminAccess(session.user.id, values.workspaceId);

        const newRole = await prisma.customRole.create({
            data: {
                name: values.name,
                workspaceId: values.workspaceId,
                permissions: values.permissions as Permission[],
                projectId: null,
                isSystem: false,
                inviteCode: generateInviteCode(10)
            }
        });

        await createAuditLog({
            workspaceId: values.workspaceId,
            entityId: newRole.id,
            entityType: ENTITY_TYPE.WORKSPACE,
            action: ACTION.CREATE,
            metadata: {
                message: `created a new workspace role "${newRole.name}"`
            }
        });

        revalidatePath(`/workspaces/${values.workspaceId}/settings`);
        return { success: "Role created successfully", data: newRole };
    } catch (error: any) {
        return { error: error.message || "Failed to create role" };
    }
}

export async function updateWorkspaceRoleAction(values: { id: string, name: string, workspaceId: string, permissions: string[] }) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        await verifyAdminAccess(session.user.id, values.workspaceId);

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
            entityId: updatedRole.id,
            entityType: ENTITY_TYPE.WORKSPACE,
            action: ACTION.UPDATE,
            metadata: {
                message: `updated permissions for workspace role "${updatedRole.name}"`
            }
        });

        revalidatePath(`/workspaces/${values.workspaceId}/settings`);
        return { success: "Role updated successfully", data: updatedRole };
    } catch (error: any) {
        return { error: error.message || "Failed to update role" };
    }
}

export async function deleteWorkspaceRoleAction(roleId: string, workspaceId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        await verifyAdminAccess(session.user.id, workspaceId);

        const role = await prisma.customRole.findUnique({ 
            where: { id: roleId },
            include: { workspaceMembers: true }
        });

        if (!role) throw new Error("Role not found");
        if (role.isSystem) throw new Error("System roles cannot be deleted.");
        if (role.isWorkspaceDefault) throw new Error("The default workspace role cannot be deleted.");
        
        if (role.workspaceMembers.length > 0) {
            throw new Error("Cannot delete role. It is currently assigned to active members.");
        }

        await prisma.customRole.delete({ where: { id: roleId } });

        await createAuditLog({
            workspaceId: workspaceId,
            entityId: roleId,
            entityType: ENTITY_TYPE.WORKSPACE,
            action: ACTION.DELETE,
            metadata: {
                message: `deleted workspace role "${role.name}"`
            }
        });

        revalidatePath(`/workspaces/${workspaceId}/settings`);
        return { success: "Role deleted successfully" };
    } catch (error: any) {
        return { error: error.message || "Failed to delete role" };
    }
}

export async function resetWorkspaceRoleInviteCodeAction(roleId: string, workspaceId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        await verifyAdminAccess(session.user.id, workspaceId);

        const updatedRole = await prisma.customRole.update({
            where: { id: roleId },
            data: { inviteCode: generateInviteCode(10) }
        });

        await createAuditLog({
            workspaceId: workspaceId,
            entityId: roleId,
            entityType: ENTITY_TYPE.WORKSPACE,
            action: ACTION.UPDATE,
            metadata: {
                message: `reset the invite link for workspace role "${updatedRole.name}"`
            }
        });

        revalidatePath(`/workspaces/${workspaceId}/settings`);
        return { success: "Invite link reset successfully", data: updatedRole };
    } catch (error: any) {
        return { error: error.message || "Failed to reset invite link" };
    }
}