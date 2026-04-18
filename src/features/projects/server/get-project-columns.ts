"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getProjectColumnsAction(projectId: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        if (!projectId) return [];

        const columns = await prisma.customColumn.findMany({
            where: { projectId },
            orderBy: { position: 'asc' }
        });

        return columns;
    } catch (error: any) {
        throw new Error("Failed to fetch columns");
    }
}