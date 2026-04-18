"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats({ workspaceId }: { workspaceId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) return null;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) return null;

        const [workspaceMember, userProjects] = await Promise.all([
            prisma.workspaceMember.findUnique({
                where: { userId_workspaceId: { userId: user.id, workspaceId } }
            }),
            prisma.projectMember.findMany({
                where: { userId: user.id },
                select: { projectId: true, role: true }
            })
        ]);

        if (!workspaceMember) return null;

        const isAdmin = workspaceMember.role === "ADMIN";
        const allowedProjectIds = userProjects.map(p => p.projectId);
        const managedProjectIds = userProjects.filter(p => p.role === "PROJECT_MANAGER" || p.role === "ADMIN").map(p => p.projectId);
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
            progress: { lt: 100 }
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

        if (!isAdmin) {
            projectWhere.id = { in: allowedProjectIds };
        }

        const [urgentTasks, urgentProjectsRaw, upcomingEvents, activityTasks] = await Promise.all([
            prisma.task.findMany({
                where: taskWhere,
                include: {
                    project: { select: { name: true, imageUrl: true } },
                    column: { select: { name: true } }
                },
                orderBy: { dueDate: 'asc' },
                take: 5
            }),
            prisma.project.findMany({
                where: projectWhere,
                include: { tasks: { select: { progress: true } } },
                orderBy: { dueDate: 'asc' },
                take: 5
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
                select: { createdAt: true, updatedAt: true, progress: true, assigneeId: true }
            })
        ]);

        const urgentProjects = urgentProjectsRaw.map((project) => {
            const totalTasks = project.tasks.length;
            const completedTasks = project.tasks.filter(t => t.progress === 100).length;
            const totalProgressSum = project.tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
            const progress = totalTasks === 0 ? 0 : Math.round(totalProgressSum / totalTasks);
            return { ...project, totalTasks, completedTasks, progress };
        });

        const activityDict: Record<string, { assigned: number; completed: number }> = {};
        for (let i = 89; i >= 0; i--) {
            const d = new Date();
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

            if (task.progress === 100) {
                 const updatedStr = task.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                 if (activityDict[updatedStr]) activityDict[updatedStr].completed += 1;
            }
        });

        memberTasks.forEach(task => {
            const createdStr = task.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (memberVelocityDict[createdStr]) memberVelocityDict[createdStr].created += 1;

            if (task.progress === 100) {
                 const updatedStr = task.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                 if (memberVelocityDict[updatedStr]) memberVelocityDict[updatedStr].completed += 1;
            }
        });

        let currentPending = memberTasks.filter(t => t.progress < 100).length;

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
            role: workspaceMember.role,
            isManager: isManagerAnywhere,
            urgentTasks,
            urgentProjects,
            upcomingEvents,
            activityData,
            memberVelocity,
            memberBurndown
        };
    } catch (error) {
        return null;
    }
}