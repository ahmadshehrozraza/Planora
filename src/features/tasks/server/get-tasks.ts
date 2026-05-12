"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions-constants";

interface GetTasksParams {
    workspaceId?: string;
    projectId?: string;
    sprintId?: string;
    assigneeId?: string;
    status?: string;
    dueDate?: string;
    search?: string;
    tagId?: string;
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
            where: { userId_workspaceId: { userId: user.id, workspaceId: params.workspaceId } },
            include: { role: true }
        });

        if (!workspaceMember) throw new Error("Unauthorized");

        const isAdmin = workspaceMember.role?.permissions?.includes(PERMISSIONS.WORKSPACE_UPDATE) || workspaceMember.role?.permissions?.includes(PERMISSIONS.WORKSPACE_DELETE);
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
                .filter(p => p.role?.permissions?.includes(PERMISSIONS.PROJECT_MANAGE_MEMBERS) || p.role?.permissions?.includes(PERMISSIONS.PROJECT_UPDATE))
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

        if (params.sprintId && params.sprintId !== "all") {
            whereClause.sprintId = params.sprintId === "no-sprint" ? null : params.sprintId;
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

        if (params.tagId && params.tagId !== "all") {
             whereClause.tags = {
                 some: {
                     id: params.tagId
                 }
             };
        }

        const tasks = await prisma.task.findMany({
            where: whereClause,
            include: {
                project: { select: { id: true, name: true, imageUrl: true } },
                assignee: { select: { id: true, name: true, email: true, image: true } },
                column: { select: { id: true, name: true, category: true } },
                sprint: { select: { id: true, name: true } },
                blockedBy: { 
                    select: { 
                        id: true, 
                        name: true,
                        column: { select: { id: true, name: true, category: true } }
                    } 
                },
                blocking: { 
                    select: { 
                        id: true, 
                        name: true,
                        column: { select: { id: true, name: true, category: true } }
                    } 
                },
                tags: { select: { id: true, name: true, color: true } }
            },
            orderBy: { position: "asc" }
        });

        return { data: tasks };
    } catch (error: any) {
        return { data: [] };
    }
}