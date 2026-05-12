"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";
import { revalidatePath } from "next/cache";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { ColumnCategory } from "@prisma/client"; 
import { getPermissions } from "@/lib/get-permissions";

function detectCycle(graph: Record<string, string[]>) {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    function dfs(node: string): boolean {
        if (recStack.has(node)) return true;
        if (visited.has(node)) return false;
        
        visited.add(node);
        recStack.add(node);
        
        const neighbors = graph[node] || [];
        for (const neighbor of neighbors) {
            if (dfs(neighbor)) return true;
        }
        
        recStack.delete(node);
        return false;
    }

    for (const node of Object.keys(graph)) {
        if (dfs(node)) return true;
    }
    return false;
}

export async function updateTaskAction(values: any) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");
        if (!values.id) throw new Error("Task ID is required");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const oldTask = await prisma.task.findUnique({
            where: { id: values.id },
            include: {
                project: { select: { status: true } },
                sprint: { select: { status: true, dueDate: true } },
                blockedBy: { select: { id: true } },
                column: { select: { category: true } }
            }
        });

        if (!oldTask) throw new Error("Task not found");

        if (oldTask.project.status === "ON_HOLD") throw new Error("Project is on hold. No changes can be made.");

        const userPermissions = await getPermissions({ 
            workspaceId: oldTask.workspaceId, 
            projectId: oldTask.projectId 
        });

        const isWorkspaceOwner = userPermissions.includes(PERMISSIONS.WORKSPACE_DELETE);
        const hasFullUpdate = userPermissions.includes(PERMISSIONS.TASK_UPDATE_FULL);
        const hasStatusUpdateOnly = userPermissions.includes(PERMISSIONS.TASK_UPDATE_STATUS);
        
        const isAssignee = oldTask.assigneeId === user.id;

        const canUpdateFull = isWorkspaceOwner || hasFullUpdate || isAssignee;
        const canUpdateStatus = canUpdateFull || hasStatusUpdateOnly;

        if (!canUpdateStatus) throw new Error("Unauthorized: You do not have permission to update this task.");

        let finalColumnId = values.columnId;
        let targetCategory: ColumnCategory = oldTask.column?.category || ColumnCategory.TODO;

        if (values.newColumnName) {
            if (!canUpdateFull) throw new Error("Unauthorized: You cannot create new columns.");

            targetCategory = values.newColumnCategory || ColumnCategory.TODO;
            const highestCol = await prisma.customColumn.findFirst({
                where: { projectId: values.projectId },
                orderBy: { position: "desc" }
            });

            const nextColPos = highestCol ? highestCol.position + 1000 : 1000;

            const newCol = await prisma.customColumn.create({
                data: {
                    name: values.newColumnName,
                    projectId: values.projectId,
                    position: nextColPos,
                    category: targetCategory
                }
            });
            finalColumnId = newCol.id;
        } else if (finalColumnId && finalColumnId !== oldTask.columnId) {
            const col = await prisma.customColumn.findUnique({ where: { id: finalColumnId } });
            if (col) targetCategory = col.category;
        }

        if (!finalColumnId) throw new Error("Status column is required");

        if (oldTask.project.status === "PLANNED" && targetCategory !== ColumnCategory.TODO) {
            throw new Error("Project is PLANNED. Tasks cannot be started or completed yet.");
        }

        if (oldTask.sprint?.status === "CLOSED" && !isWorkspaceOwner) {
            throw new Error("Cannot modify a task in a closed sprint.");
        }

        if (targetCategory === ColumnCategory.IN_PROGRESS || targetCategory === ColumnCategory.DONE) {
            const currentBlockerIds = values.blockedByIds || oldTask.blockedBy.map(b => b.id);
            if (currentBlockerIds.length > 0) {
                const blockers = await prisma.task.findMany({
                    where: { id: { in: currentBlockerIds } },
                    include: { column: true }
                });
                const incompleteBlockers = blockers.filter(b => b.column?.category !== ColumnCategory.DONE);
                if (incompleteBlockers.length > 0) {
                    throw new Error(`Cannot start or complete task. It is blocked by ${incompleteBlockers.length} incomplete task(s).`);
                }
            }
        }

        if (values.blockedByIds || values.blockingToIds) {
            const allTasks = await prisma.task.findMany({
                where: { projectId: oldTask.projectId },
                select: { id: true, blockedBy: { select: { id: true } } }
            });

            const graph: Record<string, string[]> = {};
            allTasks.forEach(t => { graph[t.id] = t.blockedBy.map(b => b.id); });

            graph[values.id] = values.blockedByIds || [];
            
            if (values.blockingToIds) {
                values.blockingToIds.forEach((blockedId: string) => {
                    if (!graph[blockedId]) graph[blockedId] = [];
                    if (!graph[blockedId].includes(values.id)) {
                        graph[blockedId].push(values.id);
                    }
                });
            }

            if (detectCycle(graph)) {
                throw new Error("Circular dependency detected. A task cannot indirectly block itself.");
            }
        }

        const taskData: any = { columnId: finalColumnId };

        if (canUpdateFull) {
            const newAssigneeId = (values.assigneeId === "" || values.assigneeId === "no-assignee") ? null : values.assigneeId;
            const newSprintId = (values.sprintId === "" || values.sprintId === "no-sprint") ? null : values.sprintId;

            if (newSprintId) {
                const sprint = await prisma.sprint.findUnique({ where: { id: newSprintId } });
                if (sprint?.status === "CLOSED") throw new Error("Cannot move task into a closed sprint.");
                if (sprint?.status === "PLANNED" && targetCategory !== ColumnCategory.TODO) {
                    throw new Error("Cannot move an active or completed task into a PLANNED sprint.");
                }
                if (values.dueDate && sprint?.dueDate && new Date(values.dueDate) > sprint.dueDate) {
                    throw new Error("Task due date cannot exceed its sprint's end date.");
                }
            }

            Object.assign(taskData, {
                name: values.name,
                description: values.description,
                sprintId: newSprintId,
                assigneeId: newAssigneeId,
                taskType: values.taskType,
                priority: values.priority,
                effortPoints: values.effortPoints,
                budget: values.budget || 0,
                currency: values.currency,
                startDate: values.startDate ? new Date(values.startDate) : null,
                dueDate: values.dueDate ? new Date(values.dueDate) : null,
            });

            if (values.blockedByIds && Array.isArray(values.blockedByIds)) {
                taskData.blockedBy = { set: values.blockedByIds.map((id: string) => ({ id })) };
            }

            if (values.blockingToIds && Array.isArray(values.blockingToIds)) {
                taskData.blocking = { set: values.blockingToIds.map((id: string) => ({ id })) };
            }

            if (values.tagIds && Array.isArray(values.tagIds)) {
                taskData.tags = { set: values.tagIds.map((id: string) => ({ id })) };
            }
        }

        const updatedTask = await prisma.task.update({
            where: { id: values.id },
            data: taskData
        });

        const changes: string[] = [];
        if (canUpdateFull) {
            if (oldTask.name !== values.name) changes.push(`renamed task from "${oldTask.name}" to "${values.name}"`);
            if (oldTask.priority !== values.priority) changes.push(`changed priority to ${values.priority.toLowerCase()}`);
        }
        if (oldTask.columnId !== finalColumnId) changes.push(`moved the task to a new status`);
        
        let logMessage = `updated the task`;
        if (changes.length > 0) {
            if (changes.length === 1) logMessage = changes[0]; 
            else {
                const lastChange = changes.pop();
                logMessage = `${changes.join(", ")} and ${lastChange}`; 
            }
        }

        await createAuditLog({
            workspaceId: updatedTask.workspaceId,
            projectId: updatedTask.projectId,
            entityId: updatedTask.id,
            entityType: ENTITY_TYPE.TASK,
            action: ACTION.UPDATE,
            metadata: { title: updatedTask.name, message: logMessage }
        });

        if (canUpdateFull && taskData.assigneeId && taskData.assigneeId !== oldTask.assigneeId && taskData.assigneeId !== user.id) {
            await createNotification({
                userIds: [taskData.assigneeId], actorId: user.id, workspaceId: updatedTask.workspaceId, projectId: updatedTask.projectId,
                entityId: updatedTask.id, entityType: "TASK", action: "ASSIGNED", title: "Task Assigned",
                message: `assigned the task "${updatedTask.name}" to you.`
            });
        }

        eventEmitter.emit('invalidate');

        revalidatePath(`/workspaces/${updatedTask.workspaceId}/tasks`);
        revalidatePath(`/workspaces/${updatedTask.workspaceId}/projects/${updatedTask.projectId}`);

        return { success: "Task updated successfully!", data: updatedTask };
    } catch (error: any) {
        return { error: error.message || "Failed to update task" };
    }
}