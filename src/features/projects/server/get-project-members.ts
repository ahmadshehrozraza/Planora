"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getProjectMembersAction({ projectId }: { projectId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { workspaceId: true }
        });

        if (!project) throw new Error("Project not found");

        const members = await prisma.projectMember.findMany({
            where: { projectId },
            include: {
                role: true,
                user: {
                    include: {
                        workspaceMembers: {
                            where: { workspaceId: project.workspaceId },
                            select: { role: true }
                        },
                        assignedTasks: {
                            where: { projectId },
                            select: { 
                                id: true, 
                                progress: true 
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedMembers = members.map(m => {
            const workspaceRole = m.user.workspaceMembers[0]?.role || "MEMBER";
            
            const tasks = m.user.assignedTasks;
            const totalTasks = tasks.length;
            
            const completedTasks = tasks.filter(t => 
                t.progress >= 90
            ).length;

            return {
                id: m.id,
                userId: m.user.id,
                name: m.user.name || "Unknown",
                email: m.user.email || "No email",
                image: m.user.image,
                role: m.role,
                workspaceRole: workspaceRole,
                createdAt: m.createdAt,
                totalTasks,
                completedTasks,
            };
        });

        return { data: formattedMembers };
    } catch (error: any) {
        console.error("GET_PROJECT_MEMBERS_ERROR", error);
        return { error: error.message || "Failed to fetch members" };
    }
}