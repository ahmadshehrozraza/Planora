import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.date( "Date & time is required."),
  workspaceId: z.string().min(1, "Workspace is required"),
  
  projectId: z.string().optional().or(z.literal("none")), 
  segmentId: z.string().optional().or(z.literal("none")),
  
  description: z.string().optional(),
});