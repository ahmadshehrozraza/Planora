import { z } from "zod";
import { ProjectStatus } from "./types";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name is too long"),
  workspaceId: z.string(),
  description: z.string().optional(),
  imageUrl: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
    ])
    .optional(),
  projectStatus: z.enum(ProjectStatus).default(ProjectStatus.ACTIVE),
  startDate: z.date().optional(),
  dueDate: z.date().min(new Date(), "Due date must be in the future"),
  budget: z.number().min(0, "Budget cannot be negative").optional(),
  currency: z.string().optional().default("PKR"),
});

export const updateProjectSchema = z.object({
    name: z.string().min(1, "Project name is required").max(100, "Project name is too long"),
  workspaceId: z.string(),
  description: z.string().optional(),
  imageUrl: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
    ])
    .optional(),
  projectStatus: z.enum(ProjectStatus),
  startDate: z.date().optional(),
  dueDate: z.date().min(new Date(), "Due date must be in the future"),
  budget: z.number().min(0, "Budget cannot be negative").optional(),
  currency: z.string().optional().default("PKR"),
}); 