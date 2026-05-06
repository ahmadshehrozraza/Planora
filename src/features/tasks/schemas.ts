import { z } from "zod";
import { TaskPriority, TaskType } from "./types";

export const taskFormSchemaObject = z.object({
  name: z.string().min(1, "Task name is required").max(100),
  description: z.string().optional(),
  workspaceId: z.string(),
  projectId: z.string().min(1, "Project is required"),
  columnId: z.string().optional(),
  newColumnName: z.string().optional(),
  sprintId: z.string().optional(),
  assigneeId: z.string().optional(),
  taskType: z.nativeEnum(TaskType),
  priority: z.nativeEnum(TaskPriority),
  dueDate: z.date(),
  startDate: z.date().optional(),
  budget: z.number().min(0).optional(),
  currency: z.string().optional(),
  effortPoints: z.number().min(1).max(10).optional(),
  progress: z.number().min(0).max(100).optional(),
  blockedByIds: z.array(z.string()).optional().default([]),
  blockingToIds: z.array(z.string()).optional().default([]),
  tagIds: z.array(z.string()).optional().default([]),
});

export const createTaskSchema = taskFormSchemaObject.superRefine((data, ctx) => {
  if (!data.columnId && !data.newColumnName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select or create a status column",
      path: ["columnId"],
    });
  }
});

export const editTaskSchema = createTaskSchema;