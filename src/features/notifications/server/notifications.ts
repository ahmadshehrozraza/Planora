"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { eventEmitter } from "@/lib/event-emitter";

export async function getNotificationsAction() {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({ 
            where: { email: session.user.email },
            select: { id: true } 
        });
        if (!user) throw new Error("User not found");

        const notifications = await prisma.notification.findMany({
            where: {
                userId: user.id, 
            },
            include: {
                actor: {
                    select: { name: true, image: true },
                },
            },
            orderBy: {
                createdAt: "desc", 
            },
            take: 20, 
        });

        return { data: notifications };
    } catch (error: any) {
        return { error: error.message || "Failed to fetch notifications" };
    }
}

export async function markNotificationReadAction({ notificationId, markAll = false }: { notificationId?: string, markAll?: boolean }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({ 
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        if (markAll) {
            await prisma.notification.updateMany({
                where: { userId: user.id, isRead: false },
                data: { isRead: true },
            });
        } else if (notificationId) {
            await prisma.notification.update({
                where: { id: notificationId, userId: user.id },
                data: { isRead: true },
            });
        }

        eventEmitter.emit('invalidate');

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to mark as read" };
    }
}