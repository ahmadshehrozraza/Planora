"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentRoleAction({ workspaceId, projectId }: { workspaceId: string, projectId?: string | null }) {
    try {
        if (!workspaceId || workspaceId === "undefined") return { data: null };

        const session = await auth();
        if (!session?.user?.id) return { data: null };

        const userId = session.user.id;

        const workspaceMember = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId, workspaceId } },
            include: { role: { select: { name: true, permissions: true } } }
        });

        if (!workspaceMember) return { data: null };

        const workspacePermissions = workspaceMember.role.permissions;

        const isOwner = workspacePermissions.includes("WORKSPACE_DELETE") || workspacePermissions.includes("WORKSPACE_MANAGE_ROLES");
        
        if (isOwner) {
            return { data: workspaceMember.role };
        }

        if (projectId && projectId !== "none" && projectId !== "null") {
            const projectMember = await prisma.projectMember.findUnique({
                where: { userId_projectId: { userId, projectId } },
                include: { role: { select: { name: true, permissions: true } } }
            });

            if (projectMember) {
                return { data: projectMember.role };
            }
        }

        return { data: workspaceMember.role };

    } catch (error) {
        console.error("[GET_CURRENT_ROLE_ERROR]", error);
        return { data: null };
    }
}