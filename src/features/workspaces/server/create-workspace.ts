"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { eventEmitter } from "@/lib/event-emitter";

const createWorkspaceServerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    inviteCode: z.string().min(1, "Invite code is required"),
    imageUrl: z.string().optional().nullable(),
});

export async function createWorkspaceAction(values: z.infer<typeof createWorkspaceServerSchema>) {
    try {
        const session = await auth();
        if (!session?.user?.email) return { error: "Unauthorized" };

        let userId = session.user.id;
        if (!userId) {
            const user = await prisma.user.findUnique({ 
                where: { email: session.user.email },
                select: { id: true }
            });
            if (!user) return { error: "User not found" };
            userId = user.id;
        }

        const newWorkspace = await prisma.workspace.create({
            data: {
                name: values.name,
                inviteCode: values.inviteCode,
                imageUrl: values.imageUrl,
                members: {
                    create: {
                        userId: userId,
                        role: "ADMIN"
                    }
                }
            }
        });

        await createAuditLog({
            workspaceId: newWorkspace.id,
            entityId: newWorkspace.id,
            entityType: ENTITY_TYPE.WORKSPACE,
            action: ACTION.CREATE,
            metadata: {
                message: `created workspace "${newWorkspace.name}"`
            }
        });

        eventEmitter.emit('invalidate');

        return { success: "Workspace created!", data: newWorkspace };
    } catch (error) {
        return { error: "Failed to create workspace" };
    }
}