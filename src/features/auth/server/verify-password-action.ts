"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function verifyPasswordAction(password: string) {
    try {
        const session = await auth();
        
        if (!session?.user?.email) {
            return { error: "Unauthorized" };
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return { error: "User not found" };
        }

        if (!user.password) {
            return { error: "OAuth accounts do not require a password" };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return { error: "Incorrect password" };
        }

        return { success: "Password verified successfully" };
    } catch (error: any) {
        console.error("VERIFY_PASSWORD_ERROR:", error);
        return { error: "Something went wrong while verifying password" };
    }
}