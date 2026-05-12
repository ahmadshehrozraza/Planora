import { z } from "zod";
import { SprintStatus } from "./types";

export const createSprintSchema = z.object({
  name: z.string().min(1, "Sprint name is required").max(100, "Sprint name is too long"),
  workspaceId: z.string(),
  projectId: z.string(),
  goal: z.string().optional(),
  description: z.string().optional(),
  capacityPoints: z.coerce.number().min(0, "Capacity cannot be negative").optional(),
  status: z.nativeEnum(SprintStatus).default(SprintStatus.PLANNED),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
});

export const editSprintSchema = z.object({
  name: z.string().min(1, "Sprint name is required").max(100, "Sprint name is too long"),
  goal: z.string().optional(),
  description: z.string().optional(),
  capacityPoints: z.coerce.number().min(0, "Capacity cannot be negative").optional(),
  status: z.nativeEnum(SprintStatus),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
});