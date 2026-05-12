"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function getEventAction({ eventId }: { eventId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");
        if (!eventId) throw new Error("Event ID is required");

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                workspace: { select: { id: true, name: true, imageUrl: true } },
                project: { select: { name: true, imageUrl: true } },
                sprint: { select: { name: true } },
                creator: { select: { name: true, image: true } },
                attachments: { select: { id: true, name: true, url: true, size: true, type: true } }
            }
        });

        if (!event) throw new Error("Event not found");

        const isMember = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: user.id, workspaceId: event.workspaceId } }
        });

        if (!isMember) throw new Error("Unauthorized access to event");

        if (!event.isOpened) {
            await prisma.event.update({ where: { id: event.id }, data: { isOpened: true } });
        }

        const formattedEvent = {
            id: event.id,
            title: event.title || "Untitled Event",
            description: event.description || "",
            date: event.date ? event.date.toISOString() : new Date().toISOString(),
            endDate: event.endDate ? event.endDate.toISOString() : null,
            time: event.date ? format(event.date, "hh:mm a") : "",
            location: event.location,
            notes: event.notes,
            status: event.status,
            attachments: event.attachments || [],

            projectId: event.projectId, 
            sprintId: event.sprintId,
            
            project: event.project ? { name: event.project.name, imageUrl: event.project.imageUrl || undefined } : null,
            sprint: event.sprint ? { name: event.sprint.name } : null,
            
            eventCreator: { 
                name: event.creator?.name || "Unknown", 
                avatar: event.creator?.image || undefined 
            },
            isOpened: true,
        };

        return { success: true, data: formattedEvent };

    } catch (error: any) {
        return { error: error.message || "Failed to fetch event." };
    }
}