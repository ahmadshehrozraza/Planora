"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { eventEmitter } from "@/lib/event-emitter";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { generateInviteCode } from "@/lib/utils"; 
import { Permission } from "@prisma/client";

const createWorkspaceServerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    imageUrl: z.string().optional().nullable(),
});

export async function createWorkspaceAction(values: z.infer<typeof createWorkspaceServerSchema>) {
    try {
        const session = await auth();
        if (!session?.user?.email) return { error: "Unauthorized" };

        const user = await prisma.user.findUnique({ 
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return { error: "User not found in database. Please log out and log in again." };
        }
        
        const validUserId = user.id;
        const inviteCode = generateInviteCode(10);

        const newWorkspace = await prisma.$transaction(async (tx) => {
            const workspace = await tx.workspace.create({
                data: {
                    name: values.name,
                    inviteCode: inviteCode,
                    imageUrl: values.imageUrl,
                    customRoles: {
                        create: [
                            {
                                name: "Owner",
                                isSystem: true,
                                isWorkspaceDefault: false,
                                inviteCode: generateInviteCode(10),
                                permissions: Object.values(PERMISSIONS) as Permission[] 
                            },
                            {
                                name: "Member",
                                isSystem: false,
                                isWorkspaceDefault: true,
                                inviteCode: generateInviteCode(10),
                                permissions: [] as Permission[] 
                            }
                        ]
                    }
                },
                include: {
                    customRoles: true
                }
            });

            const ownerRole = workspace.customRoles.find(r => r.name === "Owner");

            if (!ownerRole) {
                throw new Error("Owner role failed to create");
            }

            await tx.workspaceMember.create({
                data: {
                    userId: validUserId, 
                    workspaceId: workspace.id,
                    roleId: ownerRole.id 
                }
            });

            await tx.activityLog.create({
                data: {
                    workspaceId: workspace.id,
                    entityId: workspace.id,
                    entityType: ENTITY_TYPE.WORKSPACE,
                    action: ACTION.CREATE,
                    userId: validUserId,
                    metadata: {
                        message: `created workspace "${workspace.name}"`
                    }
                }
            });

            return workspace;
        });

        eventEmitter.emit('invalidate');

        return { success: "Workspace created!", data: newWorkspace };
        
    } catch (error: any) {
        console.error("[WORKSPACE_CREATE_ERROR]", error);
        return { error: error.message || "Failed to create workspace" };
    }
}