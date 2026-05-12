"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { ColumnCategory } from "@prisma/client";

export async function getDashboardStats({ workspaceId }: { workspaceId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) return null;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) return null;

        const [workspace, workspaceMember, userProjects] = await Promise.all([
            prisma.workspace.findUnique({ where: { id: workspaceId }, select: { createdAt: true } }),
            prisma.workspaceMember.findUnique({
                where: { userId_workspaceId: { userId: user.id, workspaceId } },
                include: { role: true }
            }),
            prisma.projectMember.findMany({
                where: { userId: user.id },
                include: { role: true }
            })
        ]);

        if (!workspaceMember || !workspace) return null;

        const isAdmin = workspaceMember.role?.permissions.includes(PERMISSIONS.WORKSPACE_UPDATE) || workspaceMember.role?.permissions.includes(PERMISSIONS.WORKSPACE_DELETE);
        const allowedProjectIds = userProjects.map(p => p.projectId);
        const managedProjectIds = userProjects.filter(p => p.role?.permissions.includes(PERMISSIONS.PROJECT_MANAGE_MEMBERS) || p.role?.permissions.includes(PERMISSIONS.PROJECT_UPDATE)).map(p => p.projectId);
        const isManagerAnywhere = managedProjectIds.length > 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90);

        const taskWhere: any = {
            workspaceId,
            dueDate: { lte: nextWeek },
            column: { category: { not: ColumnCategory.DONE } }
        };

        if (!isAdmin) {
            taskWhere.AND = [{
                OR: [
                    { assigneeId: user.id },
                    ...(managedProjectIds.length > 0 ? [{ projectId: { in: managedProjectIds } }] : [])
                ]
            }];
        }

        const projectWhere: any = {
            workspaceId,
            dueDate: { lte: nextWeek },
            status: { not: "COMPLETED" }
        };

        const activeProjectWhere: any = {
            workspaceId,
            status: { not: "COMPLETED" }
        };

        if (!isAdmin) {
            projectWhere.id = { in: allowedProjectIds };
            activeProjectWhere.id = { in: allowedProjectIds };
        }

        const [urgentTasks, urgentProjectsRaw, activeProjectsRaw, upcomingEvents, activityTasks] = await Promise.all([
            prisma.task.findMany({
                where: taskWhere,
                include: {
                    project: { select: { name: true, imageUrl: true, currency: true } },
                    column: { select: { name: true, category: true } }
                },
                orderBy: { dueDate: 'asc' },
                take: 5
            }),
            prisma.project.findMany({
                where: projectWhere,
                include: { tasks: { select: { effortPoints: true, column: { select: { category: true } } } } },
                orderBy: { dueDate: 'asc' },
                take: 5
            }),
            prisma.project.findMany({
                where: activeProjectWhere,
                include: { tasks: { select: { effortPoints: true, column: { select: { category: true } } } } },
                orderBy: { updatedAt: 'desc' },
                take: 10
            }),
            prisma.event.findMany({
                where: {
                    workspaceId,
                    date: { gte: today, lte: nextWeek },
                    ...(isAdmin ? {} : { OR: [{ projectId: null }, { projectId: { in: allowedProjectIds } }] })
                },
                include: { project: { select: { name: true } } },
                orderBy: { date: 'asc' },
                take: 5
            }),
            prisma.task.findMany({
                where: { workspaceId, createdAt: { gte: ninetyDaysAgo } },
                select: { createdAt: true, updatedAt: true, assigneeId: true, column: { select: { category: true } } }
            })
        ]);

        const urgentProjects = urgentProjectsRaw.map((project) => {
            const totalTasks = project.tasks.length;
            const completedTasks = project.tasks.filter(t => t.column?.category === ColumnCategory.DONE).length;
            const totalPoints = project.tasks.reduce((sum, task) => sum + (task.effortPoints || 0), 0);
            const completedPoints = project.tasks.filter(t => t.column?.category === ColumnCategory.DONE).reduce((sum, task) => sum + (task.effortPoints || 0), 0);
            const progress = totalPoints === 0 ? 0 : Math.round((completedPoints / totalPoints) * 100);
            return { ...project, totalTasks, completedTasks, progress };
        });

        const activeProjects = activeProjectsRaw.map((project) => {
            const totalTasks = project.tasks.length;
            const completedTasks = project.tasks.filter(t => t.column?.category === ColumnCategory.DONE).length;
            const totalPoints = project.tasks.reduce((sum, task) => sum + (task.effortPoints || 0), 0);
            const completedPoints = project.tasks.filter(t => t.column?.category === ColumnCategory.DONE).reduce((sum, task) => sum + (task.effortPoints || 0), 0);
            const progress = totalPoints === 0 ? 0 : Math.round((completedPoints / totalPoints) * 100);
            return { ...project, totalTasks, completedTasks, progress };
        });

        const timeDiff = today.getTime() - workspace.createdAt.getTime();
        const daysSinceCreation = Math.floor(timeDiff / (1000 * 3600 * 24));
        const loopStart = Math.max(6, Math.min(89, daysSinceCreation));

        const activityDict: Record<string, { assigned: number; completed: number }> = {};
        for (let i = loopStart; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            activityDict[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = { assigned: 0, completed: 0 };
        }

        const memberTasks = activityTasks.filter(t => t.assigneeId === user.id);
        const memberVelocityDict: Record<string, { created: number; completed: number }> = {};
        const memberBurndownDict: Record<string, { ideal: number; actual: number }> = {};
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            memberVelocityDict[dateStr] = { created: 0, completed: 0 };
            memberBurndownDict[dateStr] = { ideal: 0, actual: 0 };
        }

        activityTasks.forEach(task => {
            const createdStr = task.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (activityDict[createdStr]) activityDict[createdStr].assigned += 1;

            if (task.column?.category === ColumnCategory.DONE) {
                 const updatedStr = task.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                 if (activityDict[updatedStr]) activityDict[updatedStr].completed += 1;
            }
        });

        memberTasks.forEach(task => {
            const createdStr = task.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (memberVelocityDict[createdStr]) memberVelocityDict[createdStr].created += 1;

            if (task.column?.category === ColumnCategory.DONE) {
                 const updatedStr = task.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                 if (memberVelocityDict[updatedStr]) memberVelocityDict[updatedStr].completed += 1;
            }
        });

        let currentPending = memberTasks.filter(t => t.column?.category !== ColumnCategory.DONE).length;

        Object.keys(memberBurndownDict).reverse().forEach(dateStr => {
            memberBurndownDict[dateStr].actual = currentPending;
            currentPending += (memberVelocityDict[dateStr]?.completed || 0);
            currentPending -= (memberVelocityDict[dateStr]?.created || 0);
        });

        const dailyBurnRate = currentPending / 6;
        let step = 6;
        
        Object.keys(memberBurndownDict).forEach(dateStr => {
            memberBurndownDict[dateStr].ideal = Math.max(0, Math.round(dailyBurnRate * step));
            step--;
        });

        const activityData = Object.keys(activityDict).map(date => ({
            date,
            assigned: activityDict[date].assigned,
            completed: activityDict[date].completed
        }));

        const memberVelocity = Object.keys(memberVelocityDict).map(date => ({
            date,
            created: memberVelocityDict[date].created,
            completed: memberVelocityDict[date].completed
        }));

        const memberBurndown = Object.keys(memberBurndownDict).map(day => ({
            day,
            ideal: memberBurndownDict[day].ideal,
            actual: Math.max(0, memberBurndownDict[day].actual)
        }));

        return {
            role: workspaceMember.role?.name || "Member",
            isManager: isManagerAnywhere,
            urgentTasks,
            urgentProjects,
            activeProjects,
            upcomingEvents,
            activityData,
            memberVelocity,
            memberBurndown
        };
    } catch (error) {
        return null;
    }
}