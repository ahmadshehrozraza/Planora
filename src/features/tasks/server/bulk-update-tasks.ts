"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { eventEmitter } from "@/lib/event-emitter";
import { revalidatePath } from "next/cache";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { ColumnCategory } from "@prisma/client";
import { getPermissions } from "@/lib/get-permissions";

export async function bulkUpdateTasksOrder(tasks: { id: string; columnId: string; position: number }[]) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");
        if (tasks.length === 0) return { success: true };

        const firstTask = await prisma.task.findUnique({
            where: { id: tasks[0].id },
            include: { project: { select: { status: true } } }
        });

        if (!firstTask) throw new Error("Task not found");

        if (firstTask.project.status === "ON_HOLD") {
            throw new Error("Project is on hold. No changes can be made.");
        }

        const userPermissions = await getPermissions({ 
            workspaceId: firstTask.workspaceId, 
            projectId: firstTask.projectId 
        });

        const hasStatusUpdate = userPermissions.includes(PERMISSIONS.TASK_UPDATE_STATUS);
        const hasFullUpdate = userPermissions.includes(PERMISSIONS.TASK_UPDATE_FULL);
        const isWorkspaceOwner = userPermissions.includes(PERMISSIONS.WORKSPACE_DELETE);

        if (!hasStatusUpdate && !hasFullUpdate && !isWorkspaceOwner) {
            throw new Error("Unauthorized: You do not have permission to reorder tasks.");
        }

        const tasksToUpdate = await prisma.task.findMany({
            where: { id: { in: tasks.map(t => t.id) } },
            include: { blockedBy: { include: { column: true } }, sprint: true }
        });

        const columnIds = [...new Set(tasks.map(t => t.columnId))];
        const columns = await prisma.customColumn.findMany({ where: { id: { in: columnIds } } });
        const columnMap = new Map(columns.map(c => [c.id, c.category]));

        for (const t of tasksToUpdate) {
            if (t.sprint?.status === "CLOSED" && !isWorkspaceOwner) {
                throw new Error(`Task "${t.name}" is locked in a closed sprint.`);
            }

            const incomingUpdate = tasks.find(x => x.id === t.id);
            if (!incomingUpdate || incomingUpdate.columnId === t.columnId) continue;

            const targetCategory = columnMap.get(incomingUpdate.columnId);

            if (firstTask.project.status === "PLANNED" && targetCategory !== ColumnCategory.TODO) {
                throw new Error("Project is PLANNED. Tasks cannot be started or completed yet.");
            }
            if (t.sprint?.status === "PLANNED" && targetCategory !== ColumnCategory.TODO) {
                throw new Error("Cannot start tasks inside a PLANNED sprint.");
            }

            if (targetCategory === ColumnCategory.IN_PROGRESS || targetCategory === ColumnCategory.DONE) {
                const incompleteBlockers = t.blockedBy.filter(b => b.column?.category !== ColumnCategory.DONE);
                if (incompleteBlockers.length > 0) {
                    throw new Error(`Cannot move task "${t.name}". It is blocked by incomplete tasks.`);
                }
            }
        }

        const queries = tasks.map((task) =>
            prisma.task.update({
                where: { id: task.id },
                data: { columnId: task.columnId, position: task.position },
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
                    message: `reordered ${tasks.length} tasks on the board` 
                }
            });

            revalidatePath(`/workspaces/${firstTask.workspaceId}/tasks`);
            revalidatePath(`/workspaces/${firstTask.workspaceId}/projects/${firstTask.projectId}`);
        }

        eventEmitter.emit('invalidate');

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to reorder tasks" };
    }
}