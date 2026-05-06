"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

interface GetEventsProps {
    workspaceId: string;
    projectId?: string | null;
    sprintId?: string | null;
}

export async function getEventsAction({ workspaceId, projectId, sprintId }: GetEventsProps) {
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

        const whereClause: any = {
            workspaceId: workspaceId,
        };


        if (projectId && projectId !== "all") {
            const projectCondition: any = { projectId: projectId };
            
            if (sprintId && sprintId !== "all") {
                projectCondition.sprintId = sprintId === "no-sprint" ? null : sprintId;
            }
            
            whereClause.OR = [
                { projectId: null }, 
                projectCondition     
            ];
        } else if (sprintId && sprintId !== "all") {
            whereClause.OR = [
                { projectId: null },
                { sprintId: sprintId === "no-sprint" ? null : sprintId }
            ];
        }

        const events = await prisma.event.findMany({
            where: whereClause,
            include: {
                project: { select: { name: true, imageUrl: true } },
                sprint: { select: { name: true } },
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
            sprint: event.sprint ? { name: event.sprint.name } : null,

            eventCreator: { 
                name: event.creator?.name || "Unknown", 
                avatar: event.creator?.image || undefined 
            },
            
            opened: false,
            workspaceId: event.workspaceId,
            originalId: event.id 
        }));

        return { success: true, data: formattedEvents };

    } catch (error: any) {
        return { error: error.message || "Failed to fetch events." };
    }
}