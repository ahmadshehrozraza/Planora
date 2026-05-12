"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { differenceInDays, addDays, format, startOfDay, isBefore, isAfter, subDays } from "date-fns";

function isSameDayCustom(d1: Date, d2: Date) {
    return format(d1, "yyyy-MM-dd") === format(d2, "yyyy-MM-dd");
}

function endOfDayCustom(d: Date) {
    const newDate = new Date(d);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
}

export async function getProjectAnalyticsAction({ projectId }: { projectId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const [project, tasks, projectMembers, sprints, columns, risks] = await Promise.all([
            prisma.project.findUnique({ where: { id: projectId } }),
            prisma.task.findMany({ 
                where: { projectId }, 
                include: { column: true, assignee: true, sprint: true },
                orderBy: { createdAt: 'asc' }
            }),
            prisma.projectMember.findMany({ where: { projectId }, include: { user: true, role: true } }),
            prisma.sprint.findMany({ where: { projectId } }),
            prisma.customColumn.findMany({ where: { projectId }, orderBy: { position: 'asc' } }),
            prisma.risk.findMany({ where: { projectId } })
        ]);

        if (!project) throw new Error("Project not found");

        const today = startOfDay(new Date());
        const startDate = startOfDay(project.startDate || project.createdAt);
        const dueDate = project.dueDate ? startOfDay(project.dueDate) : addDays(today, 30);

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.column?.category === "DONE").length;
        const totalBudgetUsed = tasks.reduce((sum, t) => sum + (t.budget || 0), 0);
        const totalEffortPoints = tasks.reduce((sum, t) => sum + (t.effortPoints || 0), 0);
        const completedEffortPoints = tasks.filter(t => t.column?.category === "DONE").reduce((sum, t) => sum + (t.effortPoints || 0), 0);

        let projectProgress = 0;
        if (totalEffortPoints > 0) projectProgress = Math.round((completedEffortPoints / totalEffortPoints) * 100);
        else if (totalTasks > 0) projectProgress = Math.round((completedTasks / totalTasks) * 100);

        const totalDuration = differenceInDays(dueDate, startDate) || 1;
        const burndownData = [];
        let remainingEffort = totalEffortPoints;
        
        const completionsByDate: Record<string, number> = {};
        tasks.filter(t => t.column?.category === "DONE").forEach(t => {
            const d = format(t.updatedAt, "yyyy-MM-dd");
            completionsByDate[d] = (completionsByDate[d] || 0) + (t.effortPoints || 0);
        });

        const numPoints = Math.min(totalDuration, 10);
        for (let i = 0; i <= numPoints; i++) {
            const currentDate = addDays(startDate, Math.round((totalDuration / numPoints) * i));
            const isFuture = isAfter(currentDate, today);

            if (!isFuture) {
                Object.keys(completionsByDate).forEach(compDate => {
                    if (isBefore(new Date(compDate), addDays(currentDate, 1))) {
                        remainingEffort -= completionsByDate[compDate];
                        completionsByDate[compDate] = 0;
                    }
                });
            }

            burndownData.push({
                day: format(currentDate, "dd MMM"),
                ideal: Math.max(0, Math.round(totalEffortPoints - (totalEffortPoints / numPoints) * i)),
                actual: isFuture ? null : Math.max(0, remainingEffort)
            });
        }

        const velocityData = [];
        const cfdData = [];
        const defaultCol = columns[0]?.name || "To Do";

        for (let i = 13; i >= 0; i--) {
            const d = subDays(today, i);
            const dateStr = format(d, "dd MMM");

            const createdCount = tasks.filter(t => isSameDayCustom(t.createdAt, d)).length;
            const completedCount = tasks.filter(t => t.column?.category === "DONE" && isSameDayCustom(t.updatedAt, d)).length;
            velocityData.push({ date: dateStr, created: createdCount, completed: completedCount });

            const dayFlow: any = { date: dateStr };
            columns.forEach(col => dayFlow[col.name] = 0);
            if (!columns.length) dayFlow["Unmapped"] = 0;

            tasks.forEach(t => {
                if (isBefore(t.createdAt, addDays(d, 1))) {
                    if (isAfter(t.updatedAt, endOfDayCustom(d))) {
                        dayFlow[defaultCol] = (dayFlow[defaultCol] || 0) + 1;
                    } else {
                        const colName = t.column?.name || "Unmapped";
                        dayFlow[colName] = (dayFlow[colName] || 0) + 1;
                    }
                }
            });
            cfdData.push(dayFlow);
        }

        return {
            success: true,
            data: {
                meta: {
                    id: project.id,
                    name: project.name,
                    description: project.description || "",
                    projectStatus: project.status,
                    currency: project.currency,
                    budget: project.budget,
                    progress: projectProgress,
                    startDate: project.startDate,
                    dueDate: project.dueDate,
                    ImageUrl: project.imageUrl,
                    calculatedEffort: project.calculatedEffort || 0,
                    calculatedCost: project.calculatedCost || 0
                },
                kpi: {
                    totalTasks,
                    completedTasks,
                    budgetUsed: totalBudgetUsed,
                    budgetRemaining: project.budget - totalBudgetUsed,
                    effortProgress: projectProgress
                },
                risks: risks.map(r => ({
                    id: r.id,
                    title: r.title,
                    probability: r.probability,
                    impact: r.impact,
                    status: r.status
                })),
                sprints: sprints.map(sprint => {
                    const sprintTasks = tasks.filter(t => t.sprintId === sprint.id);
                    const spent = sprintTasks.reduce((sum, t) => sum + (t.budget || 0), 0);
                    const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.effortPoints || 0), 0);
                    const completedPoints = sprintTasks.filter(t => t.column?.category === "DONE").reduce((sum, t) => sum + (t.effortPoints || 0), 0);
                    const avgProgress = totalPoints === 0 ? 0 : Math.round((completedPoints / totalPoints) * 100);
                    
                    return {
                        id: sprint.id,
                        name: sprint.name,
                        goal: sprint.goal,
                        status: sprint.status,
                        spent,
                        progress: avgProgress 
                    };
                }),
                members: projectMembers.map(member => {
                    const mTasks = tasks.filter(t => t.assigneeId === member.userId);
                    const doneTasks = mTasks.filter(t => t.column?.category === "DONE");
                    return {
                        memberId: member.userId,
                        name: member.user?.name || "Unknown",
                        image: member.user?.image,
                        role: member.role?.name || "Member",
                        totalTasks: mTasks.length,
                        tasksCompleted: doneTasks.length,
                        pointsEarned: doneTasks.reduce((sum, t) => sum + (t.effortPoints || 0), 0),
                        budgetManaged: mTasks.reduce((sum, t) => sum + (t.budget || 0), 0),
                        budgetConsumed: doneTasks.reduce((sum, t) => sum + (t.budget || 0), 0)
                    };
                }),
                tasks: tasks.map(t => ({
                    id: t.id,
                    name: t.name,
                    assigneeId: t.assignee?.name || "Unassigned",
                    priority: t.priority,
                    progress: t.column?.category === "DONE" ? 100 : (t.column?.category === "IN_PROGRESS" ? 50 : 0),
                    budget: t.budget || 0,
                    effortPoints: t.effortPoints || 1,
                    column: { name: t.column?.name || "Unmapped", category: t.column?.category },
                    createdAt: t.createdAt,
                    updatedAt: t.updatedAt
                })),
                charts: {
                    burndown: burndownData,
                    velocity: velocityData,
                    cfd: cfdData,
                    columns: columns.map(c => c.name)
                }
            }
        };
    } catch (error: any) {
        return { error: error.message || "Failed to load analytics" };
    }
}