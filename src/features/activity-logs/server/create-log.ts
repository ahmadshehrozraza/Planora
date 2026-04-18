import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { ACTION, ENTITY_TYPE } from "../types";
import { eventEmitter } from "@/lib/event-emitter";

interface CreateLogProps {
  workspaceId: string;
  projectId?: string | null;
  entityId: string;
  entityType: ENTITY_TYPE;
  action: ACTION;
  metadata?: Record<string, any>; 
}

export const createAuditLog = async (props: CreateLogProps) => {
  try {
    const session = await auth();

    let userId = session?.user?.id;

    if (!userId && session?.user?.email) {
        const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });
        userId = dbUser?.id;
    }

    if (!userId) {
      throw new Error("User not found for audit log");
    }

    await prisma.activityLog.create({
      data: {
        userId,
        workspaceId: props.workspaceId,
        projectId: props.projectId,
        entityId: props.entityId,
        entityType: props.entityType,
        action: props.action,
        metadata: props.metadata || {},
      },
    });

    eventEmitter.emit('invalidate');

  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]", error);
  }
};