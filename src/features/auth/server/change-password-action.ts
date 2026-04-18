"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function changePasswordAction(currentPassword?: string, newPassword?: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        if (!newPassword) throw new Error("New password is required");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) throw new Error("User not found");

        if (user.password) {
            if (!currentPassword) throw new Error("Current password is required");
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) throw new Error("Incorrect current password");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return { success: "Password updated successfully" };
    } catch (error: any) {
        return { error: error.message || "Failed to update password" };
    }
}