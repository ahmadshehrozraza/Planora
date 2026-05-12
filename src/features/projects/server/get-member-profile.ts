"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { subDays, format, isSameDay } from "date-fns";

export async function getMemberProfileAction({ memberId }: { memberId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const member = await prisma.projectMember.findUnique({
            where: { id: memberId },
            include: { 
                user: true, 
                role: true,
                project: { select: { name: true, id: true } } 
            }
        });

        if (!member) throw new Error("Member not found");

        const memberTasks = await prisma.task.findMany({
            where: { projectId: member.projectId, assigneeId: member.userId },
            include: { sprint: true, column: true },
            orderBy: { dueDate: 'asc' }
        });

        const allProjectTasks = await prisma.task.findMany({
            where: { projectId: member.projectId },
            select: { effortPoints: true }
        });

        const projectTotalPoints = allProjectTasks.reduce((acc, t) => acc + (t.effortPoints || 0), 0);
        let memberPointsEarned = 0;
        let memberPointsAssigned = 0;
        let tasksCompletedCount = 0;

        const sprintMap = new Map();

        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = subDays(new Date(), 6 - i);
            return { date: d, day: format(d, 'EEE'), points: 0 };
        });

        let activeTask: any = null;

        memberTasks.forEach(task => {
            const isDone = task.column?.category === "DONE";
            const points = task.effortPoints || 0;

            memberPointsAssigned += points;
            if (isDone) {
                memberPointsEarned += points;
                tasksCompletedCount++;

                const taskDate = task.updatedAt;
                const velocityDay = last7Days.find(d => isSameDay(d.date, taskDate));
                if (velocityDay) velocityDay.points += points;
            } else {
                if (!activeTask) activeTask = task;
            }

            const sprintId = task.sprintId || "unassigned";
            const sprintName = task.sprint?.name || "No Sprint";
            const sprintStatus = task.sprint?.status || "ACTIVE";

            if (!sprintMap.has(sprintId)) {
                sprintMap.set(sprintId, {
                    sprintId: sprintId,
                    sprintName: sprintName,
                    sprintStatus: sprintStatus,
                    memberTasksTotal: 0,
                    memberTasksCompleted: 0,
                    memberPointsAssigned: 0,
                    memberPointsEarned: 0,
                });
            }

            const sprintObj = sprintMap.get(sprintId);
            sprintObj.memberTasksTotal++;
            sprintObj.memberPointsAssigned += points;
            if (isDone) {
                sprintObj.memberTasksCompleted++;
                sprintObj.memberPointsEarned += points;
            }
        });

        return {
            success: true,
            data: {
                meta: {
                    memberId: member.id,
                    userId: member.userId,
                    userName: member.user.name || "Unknown",
                    email: member.user.email,
                    image: member.user.image,
                    role: member.role,
                    joinedDate: member.createdAt,
                    projectId: member.projectId,
                    projectName: member.project.name,
                    status: member.user.isActive ? "Active" : "Inactive"
                },
                stats: {
                    tasksCompletedCount,
                    totalTasksAssigned: memberTasks.length,
                    currentProjectPoints: {
                        completed: memberPointsEarned,
                        percentage: memberPointsAssigned > 0 ? (memberPointsEarned / memberPointsAssigned) * 100 : 0
                    }
                },
                contribution: {
                    memberPoints: memberPointsEarned,
                    projectTotalPoints: projectTotalPoints > 0 ? projectTotalPoints : 1 
                },
                currentWork: activeTask ? {
                    activeTaskName: activeTask.name,
                    activeSprintName: activeTask.sprint?.name || "No Sprint",
                    nextDeadline: activeTask.dueDate
                } : {},
                velocityData: last7Days.map(d => ({ day: d.day, points: d.points })),
                sprints: Array.from(sprintMap.values()),
                tasks: memberTasks.map(t => ({
                    id: t.id,
                    name: t.name,
                    startDate: t.startDate,
                    endDate: t.dueDate, 
                    sprintName: t.sprint?.name || "No Sprint",
                    priority: t.priority,
                    status: t.column.name,
                    effortPoints: t.effortPoints,
                    earnedPoints: t.column?.category === "DONE" ? t.effortPoints : 0 
                }))
            }
        };

    } catch (error: any) {
        return { error: error.message || "Failed to load profile" };
    }
}