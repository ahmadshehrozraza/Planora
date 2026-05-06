"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";
import { revalidatePath } from "next/cache";

export async function createTaskAction(values: any) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        if (!values.workspaceId) throw new Error("Workspace ID is strictly required");
        if (!values.projectId) throw new Error("Project ID is strictly required");
        if (!values.name) throw new Error("Task name is required");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const project = await prisma.project.findUnique({
            where: { id: values.projectId },
            select: { name: true }
        });
        if (!project) throw new Error("Project not found");

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

        if (!finalColumnId) throw new Error("Status column is required");

        const highestPositionTask = await prisma.task.findFirst({
            where: { columnId: finalColumnId },
            orderBy: { position: "desc" }
        });

        const newTaskPos = highestPositionTask ? highestPositionTask.position + 1000 : 1000;

        const finalAssigneeId = (values.assigneeId === "" || values.assigneeId === "no-assignee") ? null : values.assigneeId;
        const finalSprintId = (values.sprintId === "" || values.sprintId === "no-sprint") ? null : values.sprintId;

        let branchPrefix = "task";
        if (values.taskType === "FEATURE") branchPrefix = "feature";
        else if (values.taskType === "DOCUMENTATION") branchPrefix = "docs";

        const words = project.name.trim().split(/\s+/);
        const projectKey = words.length === 1 
            ? project.name.substring(0, 3).toUpperCase() 
            : words.map((w: string) => w[0]).join('').toUpperCase().substring(0, 3);
            
        const formattedTitle = values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
        const branchName = `${branchPrefix}/${projectKey}-${shortId}-${formattedTitle}`;

        const taskData: any = {
            name: values.name,
            description: values.description,
            workspaceId: values.workspaceId,
            projectId: values.projectId,
            columnId: finalColumnId,
            sprintId: finalSprintId,
            assigneeId: finalAssigneeId,
            assignedById: user.id,
            taskType: values.taskType,
            priority: values.priority,
            effortPoints: values.effortPoints,
            budget: values.budget || 0,
            currency: values.currency,
            startDate: values.startDate ? new Date(values.startDate) : null,
            dueDate: values.dueDate ? new Date(values.dueDate) : null,
            position: newTaskPos,
            branchName: branchName,
        };

        if (values.blockedByIds && Array.isArray(values.blockedByIds) && values.blockedByIds.length > 0) {
            taskData.blockedBy = {
                connect: values.blockedByIds.map((id: string) => ({ id }))
            };
        }

        if (values.blockingToIds && Array.isArray(values.blockingToIds) && values.blockingToIds.length > 0) {
            taskData.blocking = {
                connect: values.blockingToIds.map((id: string) => ({ id }))
            };
        }

        if (values.tagIds && Array.isArray(values.tagIds) && values.tagIds.length > 0) {
            taskData.tags = {
                connect: values.tagIds.map((id: string) => ({ id }))
            };
        }

        const newTask = await prisma.task.create({
            data: taskData
        });

        await createAuditLog({
            workspaceId: newTask.workspaceId,
            projectId: newTask.projectId,
            entityId: newTask.id,
            entityType: ENTITY_TYPE.TASK,
            action: ACTION.CREATE,
            metadata: {
                title: newTask.name,
                message: `created task "${newTask.name}"`
            }
        });

        if (newTask.assigneeId && newTask.assigneeId !== user.id) {
            await createNotification({
                userIds: [newTask.assigneeId], 
                actorId: user.id,
                workspaceId: newTask.workspaceId,
                projectId: newTask.projectId,
                entityId: newTask.id,
                entityType: "TASK",
                action: "ASSIGNED",
                title: "New Task Assigned",
                message: `assigned a new task "${newTask.name}" to you.`
            });
        }

        eventEmitter.emit('invalidate');
        revalidatePath(`/workspaces/${newTask.workspaceId}/tasks`);

        return { success: "Task created successfully!", data: newTask };
    } catch (error: any) {
        return { error: error.message || "Failed to create task" };
    }
}