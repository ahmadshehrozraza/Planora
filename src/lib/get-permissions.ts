"use server"; 

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

interface GetPermissionsProps {
    workspaceId: any;
    projectId?: any;
}

export async function getPermissions({ workspaceId, projectId }: GetPermissionsProps) {
    
    const defaultPermissions = {
        workspaceAdmin: false,
        workspaceMember: false,
        projectManager: false,
        projectMember: false,
        canManageProject: false,
        isManagerAnywhere: false,
    };

    try {
        const wId = typeof workspaceId === "string" ? workspaceId : workspaceId?.workspaceId;
        const pId = typeof projectId === "string" ? projectId : projectId?.projectId;

        if (!wId) return defaultPermissions;

        const session = await auth();
        if (!session?.user?.email) return defaultPermissions;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) return defaultPermissions;

        const workspaceUser = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: user.id, workspaceId: wId } },
            select: { role: true }
        });

        const wRole = workspaceUser?.role;
        const isWorkspaceAdmin = wRole === "ADMIN";

        let projectUser = null;
        if (pId && pId !== "none" && pId !== "null") {
            projectUser = await prisma.projectMember.findUnique({
                where: { userId_projectId: { userId: user.id, projectId: pId } },
                select: { role: true }
            });
        }

        const pRole = projectUser?.role;

        let isManagerAnywhere = false;
        if (wId) {
            const managerRecord = await prisma.projectMember.findFirst({
                where: {
                    userId: user.id,
                    role: "PROJECT_MANAGER",
                    project: { workspaceId: wId }
                }
            });
            isManagerAnywhere = !!managerRecord;
        }

        return {
            workspaceAdmin: isWorkspaceAdmin,
            workspaceMember: !!workspaceUser,
            projectManager: pRole === "PROJECT_MANAGER",
            projectMember: !!projectUser || isWorkspaceAdmin,
            canManageProject: isWorkspaceAdmin || pRole === "PROJECT_MANAGER",
            isManagerAnywhere: isWorkspaceAdmin || isManagerAnywhere, 
        };

    } catch (error) {
        console.error("GET_PERMISSIONS_ERROR:", error);
        return defaultPermissions;
    }
}