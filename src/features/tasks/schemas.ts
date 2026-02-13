

import { z } from "zod";
import { TaskPriority, TaskStatus, TaskType } from "./types";

export const createTaskSchema =  z.object({
        name: z.string().min(1, "Name is required"),
        status: z.nativeEnum(TaskStatus),
        workspaceId: z.string(),
        projectId: z.string(),
        dueDate: z.date().optional(),
        description: z.string().optional(),
        taskType: z.nativeEnum(TaskType),
        priority: z.nativeEnum(TaskPriority),
        assigneeId: z.string().optional(),  
        assignedBy: z.string(),
    });

export const editTaskSchema = z.object({
        name: z.string().min(1, "Name is required"),
        status: z.nativeEnum(TaskStatus),
        workspaceId: z.string(),
        projectId: z.string(),
        dueDate: z.date().optional(),
        description: z.string().optional(),
        taskType: z.nativeEnum(TaskType),
        priority: z.nativeEnum(TaskPriority),
        assigneeId: z.string().optional(),  
        assignedBy: z.string(),
});