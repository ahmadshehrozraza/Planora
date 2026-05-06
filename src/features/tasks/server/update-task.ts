"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";
import { revalidatePath } from "next/cache";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { Permission } from "@prisma/client"; 
import { getPermissions } from "@/lib/get-permissions";

const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "None";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

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
                project: { select: { status: true } }
            }
        });

        if (!oldTask) throw new Error("Task not found");

        if (oldTask.project.status === "ON_HOLD") {
            throw new Error("Project is on hold. No changes can be made.");
        }

        const userPermissions = await getPermissions({ 
            workspaceId: oldTask.workspaceId, 
            projectId: oldTask.projectId 
        });

        const hasFullUpdate = userPermissions.includes(PERMISSIONS.TASK_UPDATE_FULL);
        const hasStatusUpdate = userPermissions.includes(PERMISSIONS.TASK_UPDATE_STATUS);
        const isWorkspaceOwner = userPermissions.includes(PERMISSIONS.WORKSPACE_DELETE);

        if (!hasFullUpdate && !hasStatusUpdate && !isWorkspaceOwner) {
            throw new Error("Unauthorized: You do not have permission to update this task.");
        }

        let finalColumnId = values.columnId;

        if (values.newColumnName) {
            if (!hasFullUpdate && !isWorkspaceOwner) {
                 throw new Error("Unauthorized: You cannot create new columns.");
            }

            const highestCol = await prisma.customColumn.findFirst({
                where: { projectId: values.projectId },
                orderBy: { position: "desc" }
            });

            const nextColPos = highestCol ? highestCol.position + 1000 : 1000;

            const newCol = await prisma.customColumn.create({
                data: {
                    name: values.newColumnName,
                    projectId: values.projectId,
                    position: nextColPos
                }
            });
            finalColumnId = newCol.id;
        }

        if (!finalColumnId) {
            throw new Error("Status column is required");
        }

        const newAssigneeId = (values.assigneeId === "" || values.assigneeId === "no-assignee") ? null : values.assigneeId;
        const newSprintId = (values.sprintId === "" || values.sprintId === "no-sprint") ? null : values.sprintId;

        const taskData: any = {
            name: values.name,
            description: values.description,
            projectId: values.projectId,
            columnId: finalColumnId,
            sprintId: newSprintId,
            assigneeId: newAssigneeId,
            taskType: values.taskType,
            priority: values.priority,
            effortPoints: values.effortPoints,
            progress: values.progress || 0,
            budget: values.budget || 0,
            currency: values.currency,
            startDate: values.startDate ? new Date(values.startDate) : null,
            dueDate: values.dueDate ? new Date(values.dueDate) : null,
        };

        if (values.blockedByIds && Array.isArray(values.blockedByIds)) {
            taskData.blockedBy = {
                set: values.blockedByIds.map((id: string) => ({ id }))
            };
        }

        if (values.blockingToIds && Array.isArray(values.blockingToIds)) {
            taskData.blocking = {
                set: values.blockingToIds.map((id: string) => ({ id }))
            };
        }

        if (values.tagIds && Array.isArray(values.tagIds)) {
            taskData.tags = {
                set: values.tagIds.map((id: string) => ({ id }))
            };
        }

        const updatedTask = await prisma.task.update({
            where: { id: values.id },
            data: taskData
        });

        const changes: string[] = [];
        if (oldTask.name !== values.name) changes.push(`renamed task from "${oldTask.name}" to "${values.name}"`);
        if (oldTask.priority !== values.priority) changes.push(`changed priority to ${values.priority.toLowerCase()}`);
        if (oldTask.progress !== (values.progress || 0)) changes.push(`updated progress to ${values.progress || 0}%`);
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

        const oldProgress = oldTask.progress || 0;
        const newProgress = updatedTask.progress || 0;

        if (newProgress >= 90 && oldProgress < 90) {
            const managers = await prisma.projectMember.findMany({
                where: {
                    projectId: updatedTask.projectId,
                    role: { permissions: { hasSome: [PERMISSIONS.PROJECT_MANAGE_MEMBERS as Permission, PERMISSIONS.PROJECT_UPDATE as Permission] } }
                },
                select: { userId: true }
            });

            const managerIds = managers.map(m => m.userId);

            if (managerIds.length > 0) {
                await createNotification({
                    userIds: managerIds, actorId: user.id, workspaceId: updatedTask.workspaceId, projectId: updatedTask.projectId,
                    entityId: updatedTask.id, entityType: "TASK", action: "UPDATED", title: "Task Ready for Review",
                    message: `marked task "${updatedTask.name}" as ${newProgress}% complete.`
                });
            }
        }

        if (newAssigneeId && newAssigneeId !== oldTask.assigneeId && newAssigneeId !== user.id) {
            await createNotification({
                userIds: [newAssigneeId], actorId: user.id, workspaceId: updatedTask.workspaceId, projectId: updatedTask.projectId,
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