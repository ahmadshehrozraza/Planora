"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function updateUserAction(values: { name: string, imageUrl?: string | null }) {
    try {
        const session = await auth();

        if (!session?.user?.email) throw new Error("Unauthorized");

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name: values.name,
                image: values.imageUrl
            }
        });

        return { success: "Profile updated successfully!", data: updatedUser };
    } catch (error: any) {
        console.error("UPDATE_USER_ERROR", error);
        return { error: error.message || "Failed to update profile" };
    }
}