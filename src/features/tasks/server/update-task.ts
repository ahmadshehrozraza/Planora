"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";

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
            where: { id: values.id }
        });

        if (!oldTask) throw new Error("Task not found");

        let finalColumnId = values.columnId;

        if (values.newColumnName) {
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
        const newSegmentId = (values.segmentId === "" || values.segmentId === "no-segment") ? null : values.segmentId;
        const newBlockedById = (values.blockedById === "" || values.blockedById === "no-blocked-by") ? null : values.blockedById;

        const taskData: any = {
            name: values.name,
            description: values.description,
            projectId: values.projectId,
            columnId: finalColumnId,
            segmentId: newSegmentId,
            assigneeId: newAssigneeId,
            blockedById: newBlockedById,
            taskType: values.taskType,
            priority: values.priority,
            effortPoints: values.effortPoints,
            progress: values.progress || 0,
            budget: values.budget || 0,
            currency: values.currency,
            startDate: values.startDate ? new Date(values.startDate) : null,
            dueDate: values.dueDate ? new Date(values.dueDate) : null,
        };

        if (values.blockingTo && values.blockingTo !== "" && values.blockingTo !== "no-blocking-to") {
            taskData.blocking = { set: [{ id: values.blockingTo }] };
        } else {
            taskData.blocking = { set: [] };
        }

        const updatedTask = await prisma.task.update({
            where: { id: values.id },
            data: taskData
        });

        const changes: string[] = [];

        if (oldTask.name !== values.name) {
            changes.push(`renamed task from "${oldTask.name}" to "${values.name}"`);
        }
        if (oldTask.description !== values.description && (oldTask.description || values.description)) {
            changes.push(`updated the description`);
        }
        if (oldTask.priority !== values.priority) {
            changes.push(`changed priority from ${oldTask.priority.toLowerCase()} to ${values.priority.toLowerCase()}`);
        }
        if (oldTask.effortPoints !== values.effortPoints) {
            changes.push(`changed effort points from ${oldTask.effortPoints} to ${values.effortPoints}`);
        }
        if (oldTask.progress !== (values.progress || 0)) {
            changes.push(`updated progress from ${oldTask.progress || 0}% to ${values.progress || 0}%`);
        }
        if (oldTask.budget !== (values.budget || 0)) {
            changes.push(`updated budget from ${oldTask.currency} ${oldTask.budget || 0} to ${values.currency} ${values.budget || 0}`);
        }
        
        const oldStartStr = oldTask.startDate ? new Date(oldTask.startDate).getTime() : null;
        const newStartStr = values.startDate ? new Date(values.startDate).getTime() : null;
        if (oldStartStr !== newStartStr) {
            changes.push(`changed start date from ${formatDate(oldTask.startDate)} to ${formatDate(values.startDate)}`);
        }

        const oldDueStr = oldTask.dueDate ? new Date(oldTask.dueDate).getTime() : null;
        const newDueStr = values.dueDate ? new Date(values.dueDate).getTime() : null;
        if (oldDueStr !== newDueStr) {
            changes.push(`changed due date from ${formatDate(oldTask.dueDate)} to ${formatDate(values.dueDate)}`);
        }

        if (oldTask.columnId !== finalColumnId) changes.push(`moved the task to a new status`);
        if (oldTask.segmentId !== newSegmentId) changes.push(`changed the segment`);
        if (oldTask.blockedById !== newBlockedById) changes.push(`updated blocking dependencies`);

        if (oldTask.assigneeId !== newAssigneeId) {
            if (newAssigneeId) changes.push(`assigned the task to a new member`);
            else changes.push(`unassigned the task`);
        }

        let logMessage = `updated the task`;
        if (changes.length > 0) {
            if (changes.length === 1) {
                logMessage = changes[0]; 
            } else {
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
            metadata: {
                title: updatedTask.name,
                message: logMessage 
            }
        });

        const oldProgress = oldTask.progress || 0;
        const newProgress = updatedTask.progress || 0;

        if (newProgress >= 90 && oldProgress < 90) {
            const managers = await prisma.projectMember.findMany({
                where: {
                    projectId: updatedTask.projectId,
                    role: { in: ["ADMIN", "PROJECT_MANAGER"] }
                },
                select: { userId: true }
            });

            const managerIds = managers.map(m => m.userId);

            if (managerIds.length > 0) {
                await createNotification({
                    userIds: managerIds,
                    actorId: user.id,
                    workspaceId: updatedTask.workspaceId,
                    projectId: updatedTask.projectId,
                    entityId: updatedTask.id,
                    entityType: "TASK",
                    action: "UPDATED",
                    title: "Task Ready for Review",
                    message: `marked task "${updatedTask.name}" as ${newProgress}% complete.`
                });
            }
        }

        if (newAssigneeId && newAssigneeId !== oldTask.assigneeId && newAssigneeId !== user.id) {
            await createNotification({
                userIds: [newAssigneeId],
                actorId: user.id,
                workspaceId: updatedTask.workspaceId,
                projectId: updatedTask.projectId,
                entityId: updatedTask.id,
                entityType: "TASK",
                action: "ASSIGNED",
                title: "Task Assigned",
                message: `assigned the task "${updatedTask.name}" to you.`
            });
        } else if (newAssigneeId && changes.length > 0 && newAssigneeId !== user.id) {
            await createNotification({
                userIds: [newAssigneeId],
                actorId: user.id,
                workspaceId: updatedTask.workspaceId,
                projectId: updatedTask.projectId,
                entityId: updatedTask.id,
                entityType: "TASK",
                action: "UPDATED",
                title: "Task Updated",
                message: `made changes to your task "${updatedTask.name}".`
            });
        }

        eventEmitter.emit('invalidate');

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
                    message: `reordered ${tasks.length} tasks on the board` 
                }
            });
        }

        eventEmitter.emit('invalidate');

        return { success: true };
    } catch (error) {
        return { error: "Failed to reorder tasks" };
    }
}