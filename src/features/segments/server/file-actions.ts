"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { unlink } from "fs/promises";
import path from "path";
import { eventEmitter } from "@/lib/event-emitter";

export async function getSegmentFilesAction(segmentId: string) {
    try {
        const files = await prisma.attachment.findMany({ 
            where: { segmentId },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, data: files };
    } catch (error) {
        return { error: "Failed to fetch files" };
    }
}

export async function createSegmentFileAction(data: { segmentId: string, name: string, size: number, type: string, url: string }) {
    try {
        const session = await auth();

        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) throw new Error("User not found");

        const segment = await prisma.segment.findUnique({
            where: { id: data.segmentId },
            select: { 
                projectId: true, 
                name: true,
                project: {
                    select: { workspaceId: true }
                }
            } 
        });

        if (!segment || !segment.project) throw new Error("Segment or Project not found");

        const newFile = await prisma.attachment.create({
            data: {
                name: data.name,
                size: data.size,
                type: data.type,
                url: data.url,
                segmentId: data.segmentId,
                projectId: segment.projectId,
                workspaceId: segment.project.workspaceId, 
                uploadedById: user.id
            }
        });

        await createAuditLog({
            workspaceId: segment.project.workspaceId,
            projectId: segment.projectId,
            entityId: data.segmentId,
            entityType: ENTITY_TYPE.SEGMENT, 
            action: ACTION.CREATE,
            metadata: {
                message: `uploaded a file "${data.name}" to the segment "${segment.name}"`
            }
        });

        eventEmitter.emit('invalidate');

        return { success: true, data: newFile };
    } catch (error: any) {
        console.error("FILE_CREATE_ERROR", error);
        return { error: error.message || "Failed to save file info" };
    }
}

export async function deleteSegmentFileAction(fileId: string, fileUrl: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const file = await prisma.attachment.findUnique({
            where: { id: fileId },
            include: { 
                segment: { 
                    select: { 
                        projectId: true, 
                        name: true,
                        project: { select: { workspaceId: true } }
                    } 
                } 
            }
        });

        if (!file) throw new Error("File not found");

        await prisma.attachment.delete({ where: { id: fileId } });

        if (file.segment && file.segment.project) {
            await createAuditLog({
                workspaceId: file.segment.project.workspaceId, 
                projectId: file.segment.projectId,
                entityId: file.segmentId!,
                entityType: ENTITY_TYPE.SEGMENT,
                action: ACTION.DELETE,
                metadata: {
                    message: `deleted the file "${file.name}" from the segment "${file.segment.name}"`
                }
            });
        }

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