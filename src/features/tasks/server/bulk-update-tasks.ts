"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { eventEmitter } from "@/lib/event-emitter";

export async function bulkUpdateTasksAction(tasks: { id: string; columnId: string; position: number }[]) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        if (tasks.length === 0) return { success: true };

        const firstTask = await prisma.task.findUnique({
            where: { id: tasks[0].id },
            select: { workspaceId: true, projectId: true }
        });

        const queries = tasks.map((task) =>
            prisma.task.update({
                where: { id: task.id },
                data: { 
                    columnId: task.columnId, 
                    position: task.position  
                },
            })
        );

        await prisma.$transaction(queries);

        if (firstTask) {
            await createAuditLog({
                workspaceId: firstTask.workspaceId,
                projectId: firstTask.projectId,
                entityId: firstTask.projectId,
                entityType: ENTITY_TYPE.PROJECT,
                action: ACTION.UPDATE,
                metadata: {
                    message: `Reordered ${tasks.length} tasks on the board`
                }
            });
        }

        eventEmitter.emit('invalidate');

        return { success: true };
    } catch (error: any) {
        return { error: "Failed to reorder tasks" };
    }
}