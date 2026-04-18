"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

interface GetEventsProps {
    workspaceId: string;
    projectId?: string | null;
    segmentId?: string | null;
}

export async function getEventsAction({ workspaceId, projectId, segmentId }: GetEventsProps) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        if (!workspaceId) throw new Error("Workspace ID is required");

        const isMember = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: user.id, workspaceId } }
        });

        if (!isMember) throw new Error("Unauthorized access to workspace events");

        const events = await prisma.event.findMany({
            where: {
                workspaceId: workspaceId,
                ...(projectId && projectId !== "all" ? { projectId } : {}),
                ...(segmentId && segmentId !== "all" ? { segmentId } : {}),
            },
            include: {
                project: { select: { name: true, imageUrl: true } },
                segment: { select: { name: true } },
                creator: { select: { name: true, image: true } },
            },
            orderBy: {
                date: "asc",
            },
        });

        const formattedEvents = events.map((event) => ({
            id: event.id,
            title: event.title || "Untitled Event",
            description: event.description || "",
            date: event.date ? event.date.toISOString() : new Date().toISOString(), 
            time: event.date ? format(event.date, "hh:mm a") : "", 
            
            project: event.project ? { name: event.project.name, imageUrl: event.project.imageUrl || undefined } : null,
            segment: event.segment ? { name: event.segment.name } : null,

            eventCreator: { 
                name: event.creator?.name || "Unknown", 
                avatar: event.creator?.image || undefined 
            },
            
            opened: false,
        }));

        return { success: true, data: formattedEvents };

    } catch (error: any) {
        return { error: error.message || "Failed to fetch events." };
    }
}