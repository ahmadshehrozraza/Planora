"use server";
import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getWorkspaceMembersAction(workspaceId: string) {
    try {
        const session = await auth();

        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const isMember = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: user.id, workspaceId } }
        });

        if (!isMember) throw new Error("You are not a member of this workspace");

        const members = await prisma.workspaceMember.findMany({
            where: { workspaceId },
            include: {
                user: { select: { id: true, name: true, email: true, image: true } },
                role: true
            },
            orderBy: { createdAt: 'asc' }
        });

        const formattedMembers = members.map(member => ({
            id: member.id,
            userId: member.user.id,
            workspaceId: member.workspaceId,
            name: member.user.name || "Unknown User",
            email: member.user.email,
            imageUrl: member.user.image,
            role: member.role,
            createdAt: member.createdAt
        }));

        return { data: formattedMembers, total: formattedMembers.length };
    } catch (error: any) {
        throw new Error(error.message || "Failed to fetch members");
    }
}