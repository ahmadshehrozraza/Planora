import z from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  // Date object ab Date + Time dono hold karega
  date: z.date( "Date & Time is required"), 
  workspaceId: z.string().min(1, "Workspace is required"),
  projectId: z.string().min(1, "Project is required"),
  segmentId: z.string().optional(),
  description: z.string().optional(),
});