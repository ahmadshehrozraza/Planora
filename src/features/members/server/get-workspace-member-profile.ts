"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { format, subDays, isSameDay } from "date-fns";

export async function getWorkspaceMemberProfile({ workspaceId, memberId }: { workspaceId: string, memberId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const workspaceMember = await prisma.workspaceMember.findUnique({
            where: {
                id: memberId 
            },
            include: { user: true }
        });

        if (!workspaceMember) throw new Error("Member not found in this workspace");

        const actualUserId = workspaceMember.userId;

        const assignedTasks = await prisma.task.findMany({
            where: {
                workspaceId,
                assigneeId: actualUserId
            },
            include: { column: true, project: true }
        });

        const projectMemberships = await prisma.projectMember.findMany({
            where: {
                userId: actualUserId,
                project: { workspaceId }
            },
            include: { project: true }
        });

        const totalTasksAssigned = assignedTasks.length;
        const tasksCompleted = assignedTasks.filter(t => t.progress === 100).length;
        const overdueTasks = assignedTasks.filter(t => t.progress < 100 && t.dueDate && new Date(t.dueDate) < new Date()).length;
        const totalPointsEarned = assignedTasks.filter(t => t.progress === 100).reduce((sum, t) => sum + (t.effortPoints || 0), 0);
        
        const efficiency = totalTasksAssigned > 0 ? Math.round((tasksCompleted / totalTasksAssigned) * 100) : 0;

        const statusMap = new Map<string, number>();
        assignedTasks.forEach(t => {
            const colName = t.column?.name || "Unmapped";
            statusMap.set(colName, (statusMap.get(colName) || 0) + 1);
        });

        const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#64748b", "#a855f7", "#ef4444"];
        const taskStatusData = Array.from(statusMap.entries()).map(([status, count], index) => ({
            status,
            count,
            fill: PIE_COLORS[index % PIE_COLORS.length]
        }));

        const today = new Date();
        const weeklyEffortData = Array.from({ length: 7 }).map((_, i) => {
            const d = subDays(today, 6 - i);
            const pointsCompletedThatDay = assignedTasks
                .filter(t => t.progress === 100 && isSameDay(new Date(t.updatedAt), d))
                .reduce((sum, t) => sum + (t.effortPoints || 0), 0);

            return {
                day: format(d, "EEE"), 
                points: pointsCompletedThatDay
            };
        });

        const mappedProjects = projectMemberships.map(pm => {
            const projTasks = assignedTasks.filter(t => t.projectId === pm.projectId);
            const projTasksCompleted = projTasks.filter(t => t.progress === 100).length;
            const projPoints = projTasks.filter(t => t.progress === 100).reduce((sum, t) => sum + (t.effortPoints || 0), 0);

            return {
                id: pm.projectId,
                name: pm.project.name,
                status: pm.project.status,
                roleInProject: pm.role,
                tasksAssigned: projTasks.length,
                tasksCompleted: projTasksCompleted,
                pointsEarned: projPoints
            };
        });

        const allWorkspaceProjects = await prisma.project.findMany({ where: { workspaceId } });
        const currentProjectIds = projectMemberships.map(pm => pm.projectId);
        const availableProjectsToAdd = allWorkspaceProjects
            .filter(p => !currentProjectIds.includes(p.id))
            .map(p => ({ id: p.id, name: p.name }));

        return {
            success: true,
            data: {
                id: workspaceMember.id,
                userId: actualUserId, 
                name: workspaceMember.user.name || "Unknown",
                email: workspaceMember.user.email,
                image: workspaceMember.user.image,
                role: workspaceMember.role,
                joinedDate: workspaceMember.createdAt,
                totalPointsEarned,
                kpis: { totalTasksAssigned, tasksCompleted, overdueTasks, efficiency },
                taskStatusData,
                weeklyEffortData,
                projects: mappedProjects,
                availableProjectsToAdd
            }
        };

    } catch (error: any) {
        return { error: error.message || "Failed to load member profile" };
    }
}