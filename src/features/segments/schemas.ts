import { z } from "zod";
import { SegmentStatus } from "./types";

export const createSegmentSchema = z.object({
  name: z.string().min(1, "Segment name is required").max(100, "Segment name is too long"),
  workspaceId: z.string(),
  projectId: z.string(),
  description: z.string().optional(),
  status: z.nativeEnum(SegmentStatus).default(SegmentStatus.ACTIVE),
  startDate: z.date().optional(),
  dueDate: z.date().min(new Date(), "Due date must be in the future"),
});

export const editSegmentSchema = z.object({
  name: z.string().min(1, "Segment name is required").max(100, "Segment name is too long"),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(SegmentStatus),
  startDate: z.date().nullable().optional(),
  dueDate: z.date().nullable().optional(),
});