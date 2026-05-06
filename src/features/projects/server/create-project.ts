"use server";

import { auth } from "@/auth/auth";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { prisma } from "@/lib/prisma";
import { generateInviteCode } from "@/lib/utils";
import { ProjectStatus, Permission } from "@prisma/client";
import { eventEmitter } from "@/lib/event-emitter";
import { PERMISSIONS } from "@/lib/permissions-constants";

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
            },
            include: { role: true }
        });

        if (!workspaceMember || !workspaceMember.role?.permissions.includes(PERMISSIONS.PROJECT_CREATE as Permission)) {
            throw new Error("You don't have permission to create projects");
        }

        const ALL_PROJECT_LEVEL_PERMISSIONS = Object.values(PERMISSIONS).filter(
            (p) => !p.startsWith("WORKSPACE_")
        );

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
                    customRoles: {
                        create: [
                            {
                                name: "Project Admin",
                                workspaceId: values.workspaceId,
                                isSystem: false,
                                isProjectDefault: false,
                                inviteCode: generateInviteCode(10),
                                permissions: ALL_PROJECT_LEVEL_PERMISSIONS as Permission[]
                            },
                            {
                                name: "Member",
                                workspaceId: values.workspaceId,
                                isSystem: false,
                                isProjectDefault: true,
                                inviteCode: generateInviteCode(10),
                                permissions: [
                                    PERMISSIONS.PROJECT_VIEW,
                                    PERMISSIONS.TASK_UPDATE_STATUS,
                                    PERMISSIONS.COMMENT_CREATE,
                                ] as Permission[]
                            }
                        ]
                    }
                },
                include: { customRoles: true }
            });

            const pmRole = newProject.customRoles.find(r => r.name === "Project Admin");

            await tx.projectMember.create({
                data: { 
                    userId: user.id, 
                    projectId: newProject.id, 
                    roleId: pmRole!.id
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