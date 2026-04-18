"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { ENTITY_TYPE } from "../types";

export async function getActivityLogsAction({ 
    workspaceId, 
    projectId,
    entityId,
    entityType
}: { 
    workspaceId: string, 
    projectId?: string,
    entityId?: string,
    entityType?: ENTITY_TYPE
}) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const whereClause: any = { workspaceId };
        
        if (projectId) whereClause.projectId = projectId;
        if (entityId) whereClause.entityId = entityId;
        if (entityType) whereClause.entityType = entityType;

        const logs = await prisma.activityLog.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            take: 50, 
            include: {
                user: {
                    select: { name: true, image: true }
                }
            }
        });

        return { success: true, data: logs };

    } catch (error: any) {
        console.error("GET_LOGS_ERROR:", error);
        return { error: error.message || "Failed to fetch activity logs" };
    }
}