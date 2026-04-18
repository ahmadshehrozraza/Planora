"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getProjectMembersAction(projectId: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        if (!projectId) return { data: [] };

        const members = await prisma.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                }
            }
        });

        const formattedMembers = members.map(m => ({
            id: m.id,
            role: m.role,
            userId: m.user.id,
            name: m.user.name || m.user.email?.split('@')[0] || "User",
            email: m.user.email,
            image: m.user.image
        }));

        return { data: formattedMembers };
    } catch (error: any) {
        throw new Error(error.message || "Failed to fetch project members");
    }
}