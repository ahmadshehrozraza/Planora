

import { z } from "zod";
import { TaskPriority, TaskStatus, TaskType } from "./types";

export const createTaskSchema = z.object({
  name: z.string().min(1, "Task name is required").max(100),
  description: z.string().optional(),
  workspaceId: z.string(),
  projectId: z.string().min(1, "Project is required"),
  segmentId: z.string().optional().default(""),
  assigneeId: z.string().optional().default(""),
  assignedBy: z.string(),
  status: z.nativeEnum(TaskStatus),
  taskType: z.nativeEnum(TaskType),
  priority: z.nativeEnum(TaskPriority),
  dueDate: z.date(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.number().min(0, "Budget cannot be negative").optional(),
  currency: z.string().optional().default("PKR"),
  effortPoints: z.number()
    .min(1, "Effort points must be at least 1")
    .max(10, "Effort points cannot exceed 10")
    .optional()
    .default(1),
    blockedBy: z.string().optional(),
    blockingTo: z.string().optional(),
});

export const editTaskSchema = z.object({
  name: z.string().min(1, "Task name is required").max(100),
  description: z.string().optional(),
  workspaceId: z.string(),
  projectId: z.string().min(1, "Project is required"),
  segmentId: z.string().optional().default(""),
  assigneeId: z.string().optional().default(""),
  assignedBy: z.string(),
  status: z.nativeEnum(TaskStatus),
  taskType: z.nativeEnum(TaskType),
  priority: z.nativeEnum(TaskPriority),
  dueDate: z.date(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.number().min(0, "Budget cannot be negative").optional(),
  currency: z.string().optional().default("PKR"),
  effortPoints: z.number()
    .min(1, "Effort points must be at least 1")
    .max(10, "Effort points cannot exceed 10")
    .optional()
    .default(1),
  blockedBy: z.string().optional(),
  blockingTo: z.string().optional(),
});