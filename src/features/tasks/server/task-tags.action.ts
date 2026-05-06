"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { eventEmitter } from "@/lib/event-emitter";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { getPermissions } from "@/lib/get-permissions";

export async function getTagsAction(projectId: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");
        if (!projectId) throw new Error("Project ID is required");

        const tags = await prisma.tag.findMany({
            where: { projectId },
            orderBy: { name: "asc" }
        });

        return { data: tags };
    } catch (error: any) {
        return { error: error.message || "Failed to fetch tags" };
    }
}

export async function createTagAction(values: { projectId: string; name: string; color?: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const project = await prisma.project.findUnique({
            where: { id: values.projectId },
            select: { workspaceId: true, status: true }
        });

        if (!project) throw new Error("Project not found");
        if (project.status === "ON_HOLD") throw new Error("Project is on hold. No changes can be made.");

        const userPermissions = await getPermissions({ 
            workspaceId: project.workspaceId, 
            projectId: values.projectId 
        });

        const canUpdateProject = userPermissions.includes(PERMISSIONS.PROJECT_UPDATE) || userPermissions.includes(PERMISSIONS.WORKSPACE_DELETE);
        if (!canUpdateProject) {
            throw new Error("Unauthorized: Only Project Managers or Admins can create tags.");
        }

        const existingTag = await prisma.tag.findUnique({
            where: { projectId_name: { projectId: values.projectId, name: values.name } }
        });

        if (existingTag) throw new Error("A tag with this name already exists in this project.");

        const newTag = await prisma.tag.create({
            data: {
                name: values.name,
                color: values.color || "#e2e8f0",
                projectId: values.projectId
            }
        });

        await createAuditLog({
            workspaceId: project.workspaceId,
            projectId: newTag.projectId,
            entityId: newTag.id,
            entityType: ENTITY_TYPE.PROJECT,
            action: ACTION.CREATE,
            metadata: { title: newTag.name, message: `created a new tag "${newTag.name}"` }
        });

        eventEmitter.emit('invalidate');

        return { success: "Tag created successfully", data: newTag };
    } catch (error: any) {
        return { error: error.message || "Failed to create tag" };
    }
}

export async function updateTagAction(values: { tagId: string; name: string; color: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const existingTag = await prisma.tag.findUnique({
            where: { id: values.tagId },
            include: { project: { select: { workspaceId: true, status: true } } }
        });

        if (!existingTag) throw new Error("Tag not found");
        if (existingTag.project.status === "ON_HOLD") throw new Error("Project is on hold.");

        const userPermissions = await getPermissions({ 
            workspaceId: existingTag.project.workspaceId, 
            projectId: existingTag.projectId 
        });

        const canUpdateProject = userPermissions.includes(PERMISSIONS.PROJECT_UPDATE) || userPermissions.includes(PERMISSIONS.WORKSPACE_DELETE);
        if (!canUpdateProject) {
            throw new Error("Unauthorized: Only Project Managers or Admins can update tags.");
        }

        if (existingTag.name !== values.name) {
            const duplicateCheck = await prisma.tag.findUnique({
                where: { projectId_name: { projectId: existingTag.projectId, name: values.name } }
            });
            if (duplicateCheck) throw new Error("A tag with this name already exists.");
        }

        const updatedTag = await prisma.tag.update({
            where: { id: values.tagId },
            data: { name: values.name, color: values.color }
        });

        await createAuditLog({
            workspaceId: existingTag.project.workspaceId,
            projectId: updatedTag.projectId,
            entityId: updatedTag.id,
            entityType: ENTITY_TYPE.PROJECT,
            action: ACTION.UPDATE,
            metadata: { title: updatedTag.name, message: `updated tag to "${updatedTag.name}"` }
        });

        eventEmitter.emit('invalidate');

        return { success: "Tag updated successfully", data: updatedTag };
    } catch (error: any) {
        return { error: error.message || "Failed to update tag" };
    }
}


export async function deleteTagAction(tagId: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const tagToDelete = await prisma.tag.findUnique({
            where: { id: tagId },
            include: { project: { select: { workspaceId: true, status: true } } }
        });

        if (!tagToDelete) throw new Error("Tag not found");
        if (tagToDelete.project.status === "ON_HOLD") throw new Error("Project is on hold.");

        const userPermissions = await getPermissions({ 
            workspaceId: tagToDelete.project.workspaceId, 
            projectId: tagToDelete.projectId 
        });

        const canUpdateProject = userPermissions.includes(PERMISSIONS.PROJECT_UPDATE) || userPermissions.includes(PERMISSIONS.WORKSPACE_DELETE);
        if (!canUpdateProject) {
            throw new Error("Unauthorized: Only Project Managers or Admins can delete tags.");
        }

        await prisma.tag.delete({ where: { id: tagId } });

        await createAuditLog({
            workspaceId: tagToDelete.project.workspaceId,
            projectId: tagToDelete.projectId,
            entityId: tagToDelete.id,
            entityType: ENTITY_TYPE.PROJECT,
            action: ACTION.DELETE,
            metadata: { title: tagToDelete.name, message: `deleted the tag "${tagToDelete.name}"` }
        });

        eventEmitter.emit('invalidate');

        return { success: "Tag deleted successfully" };
    } catch (error: any) {
        return { error: error.message || "Failed to delete tag" };
    }
}