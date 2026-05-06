"use server"; 

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

interface GetPermissionsProps {
    workspaceId: string;
    projectId?: string | null;
}

export async function getPermissions({ workspaceId, projectId }: GetPermissionsProps): Promise<string[]> {
    try {

        if (!workspaceId || workspaceId === "undefined") return [];

        const session = await auth();
        if (!session?.user?.email) return [];

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) return [];

        const workspaceMember = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: user.id, workspaceId } },
            include: { role: { select: { permissions: true } } }
        });

        const workspacePermissions = workspaceMember?.role?.permissions || [];

        let projectPermissions: string[] = [];
        if (projectId && projectId !== "none" && projectId !== "null") {
            const projectMember = await prisma.projectMember.findUnique({
                where: { userId_projectId: { userId: user.id, projectId } },
                include: { role: { select: { permissions: true } } }
            });
            
            projectPermissions = projectMember?.role?.permissions || [];
        }

        const combinedPermissions = new Set([...workspacePermissions, ...projectPermissions]);

        return Array.from(combinedPermissions);

    } catch (error) {
        console.error("[GET_PERMISSIONS_ERROR]", error);
        return [];
    }
}