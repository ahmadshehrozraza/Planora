import { z } from "zod";
import { TaskPriority, TaskType, ColumnCategory } from "./types";

export const taskFormSchemaObject = z.object({
  name: z.string().min(1, "Task name is required").max(100),
  description: z.string().optional(),
  workspaceId: z.string(),
  projectId: z.string().min(1, "Project is required"),
  columnId: z.string().optional(),
  newColumnName: z.string().optional(),
  newColumnCategory: z.nativeEnum(ColumnCategory).optional(),
  sprintId: z.string().optional(),
  assigneeId: z.string().optional(),
  taskType: z.nativeEnum(TaskType).default(TaskType.TASK),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.coerce.date(),
  startDate: z.coerce.date().optional(),
  budget: z.coerce.number().min(0).optional(),
  currency: z.string().optional(),
  effortPoints: z.coerce.number().min(1).max(10).optional(),
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
  
  if (data.newColumnName && !data.newColumnCategory) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Category is required for new column",
      path: ["newColumnCategory"],
    });
  }
});

export const editTaskSchema = createTaskSchema;