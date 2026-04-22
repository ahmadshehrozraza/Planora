"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getProjectLogsAction({ projectId }: { projectId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const logs = await prisma.activityLog.findMany({
            where: {
                projectId: projectId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100
        });

        const formattedLogs = logs.map(log => {
            let parsedMetadata = {};
            try {
                parsedMetadata = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : (log.metadata || {});
            } catch (e) {
                parsedMetadata = { message: "Action performed" };
            }

            return {
                ...log,
                metadata: parsedMetadata // Change: Returning metadata
            };
        });

        return { success: true, data: formattedLogs };
    } catch (error: any) {
        return { error: error.message || "Failed to fetch project logs" };
    }
}