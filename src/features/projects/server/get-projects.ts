"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions-constants";

export async function getProjects({ workspaceId }: { workspaceId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email || !workspaceId) return []; 

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        
        if (!user) return [];

        const workspaceMember = await prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId: user.id,
                    workspaceId: workspaceId
                }
            },
            include: { role: true }
        });

        if (!workspaceMember) return [];

        const isAdmin = workspaceMember.role?.permissions?.includes(PERMISSIONS.WORKSPACE_UPDATE) || workspaceMember.role?.permissions?.includes(PERMISSIONS.WORKSPACE_DELETE);

        const whereClause: any = {
            workspaceId: workspaceId
        };

        if (!isAdmin) {
            whereClause.members = {
                some: {
                    userId: user.id
                }
            };
        }

        const projects = await prisma.project.findMany({
            where: whereClause,
            include: {
                tasks: {
                    select: { progress: true, column: { select: { name: true } } } 
                },
                sprints: {
                    select: { id: true, status: true }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const projectsWithStats = projects.map((project: any) => {
            const totalTasks = project.tasks?.length || 0;
            const completedTasks = project.tasks?.filter((t: any) => 
                 t.progress >= 90
            ).length || 0; 

            const totalProgressSum = project.tasks?.reduce((sum: number, task: any) => sum + (task.progress || 0), 0) || 0;
            const progress = totalTasks === 0 ? 0 : Math.round(totalProgressSum / totalTasks);

            const totalSprints = project.sprints?.length || 0;
            const completedSprints = project.sprints?.filter((s: any) => 
                s.status === "COMPLETED"
            ).length || 0;

            const { tasks, sprints, ...projectData } = project;

            return {
                ...projectData,
                stats: {
                    totalTasks,
                    completedTasks,
                    progress,
                    totalSprints,
                    completedSprints
                }
            };
        });

        return projectsWithStats;

    } catch (error: any) {
        console.error("GET_PROJECTS_ERROR", error);
        return []; 
    }
}