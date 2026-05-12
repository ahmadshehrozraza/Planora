"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { PERMISSIONS } from "@/lib/permissions-constants";

export async function deleteAccountAction(password?: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) throw new Error("User not found");

        if (user.password) {
            if (!password) throw new Error("Password is required to confirm account deletion");
            
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) throw new Error("Incorrect password");
        }

        const adminWorkspaces = await prisma.workspaceMember.findMany({
            where: {
                userId: user.id,
                role: { permissions: { hasSome: [PERMISSIONS.WORKSPACE_UPDATE, PERMISSIONS.WORKSPACE_DELETE] } },
            },
            select: {
                workspaceId: true,
                workspace: { select: { name: true } }
            }
        });

        for (const ws of adminWorkspaces) {
            const otherAdminsCount = await prisma.workspaceMember.count({
                where: {
                    workspaceId: ws.workspaceId,
                    role: { permissions: { hasSome: [PERMISSIONS.WORKSPACE_UPDATE, PERMISSIONS.WORKSPACE_DELETE] } },
                    NOT: { userId: user.id }
                }
            });

            if (otherAdminsCount === 0) {
                throw new Error(`You are the only admin of "${ws.workspace.name}". Please transfer admin rights or delete the workspace before deleting your account.`);
            }
        }

        await prisma.$transaction(async (tx) => {
            await tx.workspaceMember.deleteMany({ where: { userId: user.id } });
            await tx.projectMember.deleteMany({ where: { userId: user.id } });
            await tx.account.deleteMany({ where: { userId: user.id } });

            await tx.user.update({
                where: { id: user.id },
                data: {
                    email: `deleted_${user.id}_${Date.now()}@planora.local`,
                    password: null,
                    isActive: false,
                    emailVerified: null,
                    name: "Deleted User",
                    image: null,
                }
            });
        });

        return { success: "Account deleted successfully" };
    } catch (error: any) {
        return { error: error.message || "Failed to delete account" };
    }
}