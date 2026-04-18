"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
    try {
        const session = await auth();
        
        if (!session?.user?.email) {
            return null; 
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
            }
        });

        return user;
    } catch (error) {
        console.error("GET_CURRENT_USER_ERROR:", error);
        return null;
    }
}