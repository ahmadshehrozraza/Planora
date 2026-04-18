import { prisma } from "@/lib/prisma";
import { eventEmitter } from "@/lib/event-emitter";

interface CreateNotificationProps {
    userIds: string[]; 
    actorId: string;  
    workspaceId: string;
    projectId?: string | null;
    entityId: string;
    entityType: "TASK" | "PROJECT" | "WORKSPACE";
    action: "ASSIGNED" | "UPDATED" | "CREATED" | "COMMENTED";
    title: string;
    message: string;
}

export const createNotification = async (props: CreateNotificationProps) => {
    try {
        if (!props.actorId) return;

        const targetUserIds = props.userIds.filter((id) => id !== props.actorId);

        if (targetUserIds.length === 0) return;

        const notificationsData = targetUserIds.map((userId) => ({
            userId,
            actorId: props.actorId,
            workspaceId: props.workspaceId,
            projectId: props.projectId,
            entityId: props.entityId,
            entityType: props.entityType,
            action: props.action,
            title: props.title,
            message: props.message,
        }));

        await prisma.notification.createMany({
            data: notificationsData,
        });

        eventEmitter.emit('invalidate');

    } catch (error) {
        console.error("[CREATE_NOTIFICATION_ERROR]", error);
    }
};