import { z } from "zod";
import { SprintStatus } from "./types";

export const createSprintSchema = z.object({
  name: z.string().min(1, "Sprint name is required").max(100, "Sprint name is too long"),
  workspaceId: z.string(),
  projectId: z.string(),
  goal: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(SprintStatus).default(SprintStatus.ACTIVE),
  startDate: z.date().optional(),
  dueDate: z.date().min(new Date(), "Due date must be in the future"),
});

export const editSprintSchema = z.object({
  name: z.string().min(1, "Sprint name is required").max(100, "Sprint name is too long"),
  goal: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(SprintStatus),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
});