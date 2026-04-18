"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { eventEmitter } from "@/lib/event-emitter";

export async function createColumnAction({ projectId, name }: { projectId: string; name: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { workspaceId: true }
        });

        if (!project) throw new Error("Project not found");

        const highestCol = await prisma.customColumn.findFirst({
            where: { projectId },
            orderBy: { position: "desc" }
        });

        const newPos = highestCol ? highestCol.position + 1000 : 1000;

        const newCol = await prisma.customColumn.create({
            data: { name, projectId, position: newPos }
        });

        await createAuditLog({
            workspaceId: project.workspaceId,
            projectId: newCol.projectId,
            entityId: newCol.id,
            entityType: ENTITY_TYPE.COLUMN,
            action: ACTION.CREATE,
            metadata: {
                title: newCol.name,
                message: `created a new column "${newCol.name}"`
            }
        });

        eventEmitter.emit('invalidate');

        return { success: true, data: newCol };
    } catch (error: any) {
        return { error: error.message || "Failed to create column" };
    }
}

export async function updateColumnAction({ columnId, name }: { columnId: string; name: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const updatedCol = await prisma.customColumn.update({
            where: { id: columnId },
            data: { name },
            include: {
                project: { select: { workspaceId: true } }
            }
        });

        await createAuditLog({
            workspaceId: updatedCol.project.workspaceId,
            projectId: updatedCol.projectId,
            entityId: updatedCol.id,
            entityType: ENTITY_TYPE.COLUMN,
            action: ACTION.UPDATE,
            metadata: {
                title: updatedCol.name,
                message: `renamed column to "${updatedCol.name}"`
            }
        });

        eventEmitter.emit('invalidate');

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to rename column" };
    }
}

export async function deleteColumnAction({ columnId }: { columnId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const columnToDelete = await prisma.customColumn.findUnique({
            where: { id: columnId },
            include: {
                project: { select: { workspaceId: true } }
            }
        });

        if (!columnToDelete) throw new Error("Column not found");

        await prisma.customColumn.delete({
            where: { id: columnId }
        });

        await createAuditLog({
            workspaceId: columnToDelete.project.workspaceId,
            projectId: columnToDelete.projectId,
            entityId: columnToDelete.id,
            entityType: ENTITY_TYPE.COLUMN,
            action: ACTION.DELETE,
            metadata: {
                title: columnToDelete.name,
                message: `deleted the column "${columnToDelete.name}"`
            }
        });

        eventEmitter.emit('invalidate');

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to delete column" };
    }
}

export async function bulkUpdateColumnsOrder({ columns }: { columns: { id: string; position: number }[] }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        if (columns.length === 0) return { success: true };

        const firstCol = await prisma.customColumn.findUnique({
            where: { id: columns[0].id },
            include: {
                project: { select: { workspaceId: true } }
            }
        });

        const queries = columns.map((col) =>
            prisma.customColumn.update({
                where: { id: col.id },
                data: { position: col.position },
            })
        );

        await prisma.$transaction(queries);

        if (firstCol) {
            await createAuditLog({
                workspaceId: firstCol.project.workspaceId,
                projectId: firstCol.projectId,
                entityId: firstCol.projectId,
                entityType: ENTITY_TYPE.PROJECT,
                action: ACTION.UPDATE,
                metadata: {
                    message: `reordered ${columns.length} columns on the board`
                }
            });
        }

        eventEmitter.emit('invalidate');

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to reorder columns" };
    }
}