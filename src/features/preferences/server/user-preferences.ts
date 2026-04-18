"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getUserPreferences() {
    try {
        const session = await auth();
        if (!session?.user?.email) return null;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, preferences: true }
        });

        if (!user) return null;

        return user.preferences || {
            theme: "system",
            sidebarExpanded: true,
            lastWorkspaceId: null
        };
    } catch (error) {
        return null;
    }
}

interface UpdatePreferencesArgs {
    theme?: string;
    sidebarExpanded?: boolean;
    lastWorkspaceId?: string;
}

export async function updateUserPreferences(data: UpdatePreferencesArgs) {
    try {
        const session = await auth();
        
        if (!session?.user?.email) {
            return { success: true, message: "No session found" };
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return { success: true, message: "User not found" };
        }

        const updated = await prisma.userPreference.upsert({
            where: { userId: user.id },
            update: data,
            create: {
                userId: user.id,
                ...data,
                theme: data.theme ?? "system",
                sidebarExpanded: data.sidebarExpanded ?? true,
            }
        });

        return { success: true, data: updated };
    } catch (error: any) {
        return { error: error.message || "Failed to update preferences" };
    }
}