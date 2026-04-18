"use server";

import { auth } from "@/auth/auth";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { prisma } from "@/lib/prisma";
import { generateInviteCode } from "@/lib/utils";
import { ProjectStatus, ProjectRole } from "@prisma/client";
import { eventEmitter } from "@/lib/event-emitter";

export async function createProjectAction(values: any) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const workspaceMember = await prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: { userId: user.id, workspaceId: values.workspaceId }
            }
        });

        if (!workspaceMember || workspaceMember.role !== "ADMIN") {
            throw new Error("Only Workspace Admins can create projects");
        }

        const project = await prisma.$transaction(async (tx) => {
            const newProject = await tx.project.create({
                data: {
                    name: values.name,
                    description: values.description,
                    workspaceId: values.workspaceId,
                    inviteCode: generateInviteCode(10),
                    status: (values.projectStatus as ProjectStatus) || ProjectStatus.ACTIVE,
                    currency: values.currency || "PKR",
                    budget: Number(values.budget) || 0,
                    startDate: values.startDate ? new Date(values.startDate) : null,
                    dueDate: values.dueDate ? new Date(values.dueDate) : null,
                    imageUrl: values.imageUrl,
                    githubRepoUrl: values.githubRepoUrl || null,
                }
            });

            await tx.projectMember.create({
                data: { 
                    userId: user.id, 
                    projectId: newProject.id, 
                    role: "PROJECT_MANAGER"
                }
            });

            await tx.customColumn.createMany({
                data: [
                    { name: "Backlog", position: 1000, projectId: newProject.id },
                    { name: "To Do", position: 2000, projectId: newProject.id },
                    { name: "In Progress", position: 3000, projectId: newProject.id },
                    { name: "In Review", position: 4000, projectId: newProject.id },
                    { name: "Done", position: 5000, projectId: newProject.id },
                ]
            });

            return newProject;
        });

        await createAuditLog({
            workspaceId: project.workspaceId,
            projectId: project.id, 
            entityId: project.id,
            entityType: ENTITY_TYPE.PROJECT,
            action: ACTION.CREATE,
            metadata: {
                title: project.name,
                message: `Created a new project "${project.name}"`
            }
        });

        eventEmitter.emit('invalidate');

        return { success: "Project created!", data: project };

    } catch (error: any) {
        return { error: error.message || "Failed to create project" };
    }
}