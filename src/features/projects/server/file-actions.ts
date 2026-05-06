"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { unlink } from "fs/promises";
import path from "path";
import { eventEmitter } from "@/lib/event-emitter";
import { getPermissions } from "@/lib/get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";

export async function getProjectFilesAction(projectId: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { workspaceId: true }
        });

        if (!project) throw new Error("Project not found");

        const userPerms = await getPermissions({ workspaceId: project.workspaceId, projectId });
        const isManager = userPerms.includes(PERMISSIONS.PROJECT_UPDATE) || userPerms.includes(PERMISSIONS.WORKSPACE_DELETE);

        const folders = await prisma.projectFolder.findMany({
            where: {
                projectId,
                ...(isManager ? {} : { isRestricted: false })
            },
            orderBy: { createdAt: "desc" }
        });

        const files = await prisma.attachment.findMany({
            where: {
                projectId,
                ...(isManager ? {} : {
                    OR: [
                        { folderId: null },
                        { folder: { isRestricted: false } }
                    ]
                })
            },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, data: { folders, files } };
    } catch (error: any) {
        return { error: error.message || "Failed to fetch files" };
    }
}

export async function createProjectFolderAction({ projectId, name, isRestricted }: { projectId: string; name: string; isRestricted: boolean }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { workspaceId: true, status: true }
        });

        if (!project) throw new Error("Project not found");
        if (project.status === "ON_HOLD") throw new Error("Project is on hold.");

        const userPerms = await getPermissions({ workspaceId: project.workspaceId, projectId });
        const isManager = userPerms.includes(PERMISSIONS.PROJECT_UPDATE) || userPerms.includes(PERMISSIONS.WORKSPACE_DELETE);

        if (!isManager) throw new Error("Only managers can create folders.");

        const existingFolder = await prisma.projectFolder.findUnique({
            where: { projectId_name: { projectId, name } }
        });

        if (existingFolder) throw new Error("A folder with this name already exists.");

        const newFolder = await prisma.projectFolder.create({
            data: { name, projectId, isRestricted }
        });

        await createAuditLog({
            workspaceId: project.workspaceId,
            projectId: projectId,
            entityId: newFolder.id,
            entityType: ENTITY_TYPE.PROJECT,
            action: ACTION.CREATE,
            metadata: { message: `created a folder "${name}"` }
        });

        eventEmitter.emit('invalidate');
        return { success: true, data: newFolder };
    } catch (error: any) {
        return { error: error.message || "Failed to create folder" };
    }
}

export async function updateProjectFolderAction({ folderId, projectId, name, isRestricted }: { folderId: string; projectId: string; name: string; isRestricted: boolean }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { workspaceId: true, status: true }
        });

        if (!project) throw new Error("Project not found");
        if (project.status === "ON_HOLD") throw new Error("Project is on hold.");

        const userPerms = await getPermissions({ workspaceId: project.workspaceId, projectId });
        const isManager = userPerms.includes(PERMISSIONS.PROJECT_UPDATE) || userPerms.includes(PERMISSIONS.WORKSPACE_DELETE);

        if (!isManager) throw new Error("Only managers can update folders.");

        const duplicateCheck = await prisma.projectFolder.findFirst({
            where: { projectId, name, id: { not: folderId } }
        });

        if (duplicateCheck) throw new Error("Another folder with this name already exists.");

        const updatedFolder = await prisma.projectFolder.update({
            where: { id: folderId },
            data: { name, isRestricted }
        });

        await createAuditLog({
            workspaceId: project.workspaceId,
            projectId: projectId,
            entityId: updatedFolder.id,
            entityType: ENTITY_TYPE.PROJECT,
            action: ACTION.UPDATE,
            metadata: { message: `updated folder to "${name}"` }
        });

        eventEmitter.emit('invalidate');
        return { success: true, data: updatedFolder };
    } catch (error: any) {
        return { error: error.message || "Failed to update folder" };
    }
}

export async function deleteProjectFolderAction({ folderId, projectId }: { folderId: string; projectId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const folder = await prisma.projectFolder.findUnique({
            where: { id: folderId },
            include: { 
                attachments: { select: { id: true } },
                project: { select: { workspaceId: true, status: true } }
            }
        });

        if (!folder || !folder.project) throw new Error("Folder not found");
        if (folder.project.status === "ON_HOLD") throw new Error("Project is on hold.");

        const userPerms = await getPermissions({ workspaceId: folder.project.workspaceId, projectId });
        const isManager = userPerms.includes(PERMISSIONS.PROJECT_UPDATE) || userPerms.includes(PERMISSIONS.WORKSPACE_DELETE);

        if (!isManager) throw new Error("Only managers can delete folders.");

        if (folder.attachments.length > 0) {
            throw new Error("Folder is not empty. Please delete or move the files first.");
        }

        await prisma.projectFolder.delete({ where: { id: folderId } });

        await createAuditLog({
            workspaceId: folder.project.workspaceId,
            projectId: projectId,
            entityId: folderId,
            entityType: ENTITY_TYPE.PROJECT,
            action: ACTION.DELETE,
            metadata: { message: `deleted the folder "${folder.name}"` }
        });

        eventEmitter.emit('invalidate');
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to delete folder" };
    }
}

export async function createProjectFileAction(data: { projectId: string, folderId?: string, name: string, size: number, type: string, url: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const project = await prisma.project.findUnique({
            where: { id: data.projectId },
            select: { workspaceId: true, name: true, status: true }
        });

        if (!project) throw new Error("Project not found");
        if (project.status === "ON_HOLD") throw new Error("Project is on hold.");

        if (data.folderId) {
            const folder = await prisma.projectFolder.findUnique({ where: { id: data.folderId } });
            if (folder?.isRestricted) {
                const userPerms = await getPermissions({ workspaceId: project.workspaceId, projectId: data.projectId });
                const isManager = userPerms.includes(PERMISSIONS.PROJECT_UPDATE) || userPerms.includes(PERMISSIONS.WORKSPACE_DELETE);
                if (!isManager) throw new Error("You do not have permission to upload to this restricted folder.");
            }
        }

        const newFile = await prisma.attachment.create({
            data: {
                name: data.name,
                size: data.size,
                type: data.type,
                url: data.url,
                projectId: data.projectId,
                folderId: data.folderId || null,
                workspaceId: project.workspaceId,
                uploadedById: user.id
            }
        });

        await createAuditLog({
            workspaceId: project.workspaceId,
            projectId: data.projectId,
            entityId: data.projectId,
            entityType: ENTITY_TYPE.PROJECT,
            action: ACTION.CREATE,
            metadata: { message: `uploaded a file "${data.name}" to the project "${project.name}"` }
        });

        eventEmitter.emit('invalidate');
        return { success: true, data: newFile };
    } catch (error: any) {
        return { error: error.message || "Failed to save file info" };
    }
}

export async function deleteProjectFileAction(fileId: string, fileUrl: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const file = await prisma.attachment.findUnique({
            where: { id: fileId },
            include: { project: { select: { workspaceId: true, name: true, status: true } } }
        });

        if (!file || !file.project) throw new Error("File not found");
        if (file.project.status === "ON_HOLD") throw new Error("Project is on hold.");

        await prisma.attachment.delete({ where: { id: fileId } });

        await createAuditLog({
            workspaceId: file.project.workspaceId, 
            projectId: file.projectId,
            entityId: file.projectId!,
            entityType: ENTITY_TYPE.PROJECT,
            action: ACTION.DELETE,
            metadata: { message: `deleted the file "${file.name}" from the project "${file.project.name}"` }
        });

        try {
            const fileName = fileUrl.split("/").pop();
            if (fileName) {
                const filePath = path.join(process.cwd(), "public", "uploads", "files", fileName);
                await unlink(filePath);
            }
        } catch (fsError) {
            console.error("Could not delete physical file:", fsError);
        }

        eventEmitter.emit('invalidate');
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to delete file" };
    }
}