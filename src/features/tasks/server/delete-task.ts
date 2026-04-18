"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { eventEmitter } from "@/lib/event-emitter";

export async function deleteTaskAction(taskId: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");
        if (!taskId) throw new Error("Task ID is required");

        const deletedTask = await prisma.task.delete({
            where: { id: taskId }
        });

        await createAuditLog({
            workspaceId: deletedTask.workspaceId,
            projectId: deletedTask.projectId,
            entityId: deletedTask.id,
            entityType: ENTITY_TYPE.TASK,
            action: ACTION.DELETE,
            metadata: {
                title: deletedTask.name,
                message: `Deleted task "${deletedTask.name}"`
            }
        });

        eventEmitter.emit('invalidate');

        return { success: "Task deleted successfully!", data: deletedTask };
    } catch (error: any) {
        return { error: error.message || "Failed to delete task" };
    }
}