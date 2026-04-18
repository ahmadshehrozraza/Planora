"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

// export const revalidate = 0;

interface GetTasksParams {
    workspaceId?: string;
    projectId?: string;
    segmentId?: string;
    assigneeId?: string;
    status?: string;
    dueDate?: string;
    search?: string;
}

export async function getTasksAction(params: GetTasksParams) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");
        if (!params.workspaceId) return { data: [] };

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const workspaceMember = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: user.id, workspaceId: params.workspaceId } }
        });

        if (!workspaceMember) throw new Error("Unauthorized");

        const isAdmin = workspaceMember.role === "ADMIN";
        const isGlobalView = !params.projectId || params.projectId === "all";

        const whereClause: any = {
            workspaceId: params.workspaceId,
        };

        if (!isAdmin) {
            const userProjects = await prisma.projectMember.findMany({
                where: { userId: user.id },
                select: { projectId: true, role: true }
            });

            if (userProjects.length === 0) return { data: [] };

            const allowedProjectIds = userProjects.map(p => p.projectId);
            const managedProjectIds = userProjects
                .filter(p => p.role === "PROJECT_MANAGER" || p.role === "ADMIN")
                .map(p => p.projectId);

            if (!isGlobalView) {
                if (!allowedProjectIds.includes(params.projectId!)) {
                    return { data: [] }; 
                }
                whereClause.projectId = params.projectId;
            } else {
                whereClause.projectId = { in: allowedProjectIds };

                whereClause.AND = [
                    {
                        OR: [
                            { assigneeId: user.id },
                            ...(managedProjectIds.length > 0 ? [{ projectId: { in: managedProjectIds } }] : [])
                        ]
                    }
                ];
            }
        } else {
            if (!isGlobalView) {
                whereClause.projectId = params.projectId;
            }
        }

        if (params.segmentId && params.segmentId !== "all") {
            whereClause.segmentId = params.segmentId === "no-segment" ? null : params.segmentId;
        }

        if (params.assigneeId && params.assigneeId !== "all-tasks") {
            whereClause.assigneeId = params.assigneeId === "no-assignee" ? null : params.assigneeId;
        }

        if (params.status && params.status !== "all") {
            whereClause.columnId = params.status;
        }

        if (params.dueDate) {
            const startOfDay = new Date(params.dueDate);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(params.dueDate);
            endOfDay.setHours(23, 59, 59, 999);

            whereClause.dueDate = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }

        if (params.search) {
             whereClause.name = {
                 contains: params.search,
                 mode: 'insensitive'
             };
        }

        const tasks = await prisma.task.findMany({
            where: whereClause,
            include: {
                project: { select: { id: true, name: true, imageUrl: true } },
                assignee: { select: { id: true, name: true, email: true, image: true } },
                column: { select: { id: true, name: true } },
                segment: { select: { id: true, name: true } },
                blockedBy: { select: { id: true, name: true } },
                blocking: { select: { id: true, name: true } },
            },
            orderBy: { position: "asc" }
        });

        return { data: tasks };
    } catch (error: any) {
        console.error("GET_TASKS_ERROR:", error);
        return { data: [] };
    }
}