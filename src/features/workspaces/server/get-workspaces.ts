"use server";
import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getWorkspaces() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });
    if (!user) throw new Error("User not found");

    return await prisma.workspace.findMany({
      where: {
        members: { some: { userId: user.id } },
      },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    throw new Error("Failed to fetch workspaces");
  }
}