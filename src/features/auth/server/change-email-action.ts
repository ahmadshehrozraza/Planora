"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function changeEmailAction(currentPassword?: string, newEmail?: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        if (!newEmail) throw new Error("New email is required");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) throw new Error("User not found");

        if (user.password) {
            if (!currentPassword) throw new Error("Current password is required");
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) throw new Error("Incorrect current password");
        }

        const existingEmail = await prisma.user.findUnique({
            where: { email: newEmail }
        });

        if (existingEmail) throw new Error("This email is already in use by another account");

        await prisma.user.update({
            where: { id: user.id },
            data: { email: newEmail, emailVerified: null } 
        });

        return { success: "Email updated successfully" };
    } catch (error: any) {
        return { error: error.message || "Failed to update email" };
    }
}