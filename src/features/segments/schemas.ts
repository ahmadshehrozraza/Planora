import z from "zod";
import { SegmentStatus } from "./types";


export const createSegmentSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name is too long"),
  workspaceId: z.string(),
  projectId: z.string(),
  description: z.string().optional(),
  segmentStatus: z.enum(SegmentStatus).default(SegmentStatus.ACTIVE),
  startDate: z.date().optional(),
  dueDate: z.date().min(new Date(), "Due date must be in the future"),
});

export const editSegmentSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name is too long"),
  workspaceId: z.string(),
  projectId: z.string(),
  description: z.string().optional(),
  segmentStatus: z.enum(SegmentStatus),
  startDate: z.date().optional(),
  dueDate: z.date().min(new Date(), "Due date must be in the future"),
});