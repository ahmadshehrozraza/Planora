"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getProject({ projectId }: { projectId: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                workspace: {
                    members: {
                        some: {
                            userId: user.id
                        }
                    }
                }
            }
        });

        if (!project) {
            throw new Error("Project not found or access denied");
        }

        return project;

    } catch (error: any) {
        console.error("GET_PROJECT_ERROR:", error);
        throw new Error("Failed to fetch project");
    }
}