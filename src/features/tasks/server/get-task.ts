"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getTaskAction(taskId: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");
        if (!taskId) throw new Error("Task ID is required");

        const task = await prisma.task.findUnique({
            where: { 
                id: taskId 
            },
            include: {
                project: {
                    select: { id: true, name: true, imageUrl: true, githubRepoUrl: true }
                },
                column: {
                    select: { id: true, name: true }
                },
                assignee: {
                    select: { id: true, name: true, email: true, image: true }
                },
                segment: {
                    select: { id: true, name: true }
                },
                blockedBy: {
                    select: { id: true, name: true, column: true }
                },
                blocking: {
                    select: { id: true, name: true, column: true }
                },
                assignedBy: {
                    select: { id: true, name: true, image: true }
                }
            }
        });

        if (!task) {
            throw new Error("Task not found");
        }

        return { data: task };
    } catch (error: any) {
        throw new Error(error.message || "Failed to fetch task");
    }
}