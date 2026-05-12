import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.date({ message: "Start Date & time is required." }),
  endDate: z.date().optional().nullable(),
  workspaceId: z.string().min(1, "Workspace is required"),
  projectId: z.string().optional().or(z.literal("none")), 
  sprintId: z.string().optional().or(z.literal("none")),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "MISSED"]).optional().default("SCHEDULED"),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string(),
  })).optional().default([]),
});