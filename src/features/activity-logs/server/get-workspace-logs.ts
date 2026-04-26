"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getWorkspaceLogsAction({ workspaceId }: { workspaceId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const logs = await prisma.activityLog.findMany({
            where: { workspaceId },
            include: {
                user: {
                    select: { name: true, image: true }
                }
            },
            orderBy: { createdAt: "desc" },
            // take: 50
        });

        return { success: true, data: logs };
    } catch (error) {
        return { error: "Failed to fetch logs" };
    }
}