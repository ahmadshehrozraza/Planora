import z from "zod";

export const createEventSchema = z.object({
    title: z.string().min(1, "Event title is required"),
    date: z.date( "Date is required"),
    workspaceId: z.string().min(1, "Workspace is required"),
    projectId: z.string().min(1, "Project is required"),
    segmentId: z.string().min(1, "Segment is required"),
    description: z.string().optional(),
});