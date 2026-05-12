"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createRiskSchema, updateRiskSchema } from "../schemas";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { eventEmitter } from "@/lib/event-emitter";

export async function createRiskAction(values: z.infer<typeof createRiskSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("User not found");

    const validatedData = createRiskSchema.parse(values);

    const risk = await prisma.risk.create({
      data: {
        title: validatedData.title,
        probability: validatedData.probability,
        impact: validatedData.impact,
        mitigation: validatedData.mitigation,
        status: validatedData.status,
        projectId: validatedData.projectId,
        reportedById: user.id,
      }
    });

    await createAuditLog({
      workspaceId: validatedData.workspaceId,
      projectId: risk.projectId,
      entityId: risk.id,
      entityType: "RISK" as ENTITY_TYPE,
      action: ACTION.CREATE,
      metadata: { title: risk.title, message: `logged a new project risk: "${risk.title}"` }
    });

    eventEmitter.emit('invalidate');
    return { success: true, data: risk };
  } catch (error: any) {
    return { error: error.message || "Failed to log risk." };
  }
}

export async function getProjectRisksAction(projectId: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const risks = await prisma.risk.findMany({
      where: { projectId },
      include: {
        reportedBy: { select: { id: true, name: true, image: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: risks };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch risks." };
  }
}

export async function updateRiskAction(values: z.infer<typeof updateRiskSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const validatedData = updateRiskSchema.parse(values);
    
    const risk = await prisma.risk.update({
      where: { id: validatedData.id },
      data: {
        title: validatedData.title,
        probability: validatedData.probability,
        impact: validatedData.impact,
        mitigation: validatedData.mitigation,
        status: validatedData.status,
      }
    });

    await createAuditLog({
      workspaceId: validatedData.workspaceId,
      projectId: risk.projectId,
      entityId: risk.id,
      entityType: "RISK" as ENTITY_TYPE,
      action: ACTION.UPDATE,
      metadata: { title: risk.title, message: `updated risk: "${risk.title}"` }
    });

    eventEmitter.emit('invalidate');
    return { success: true, data: risk };
  } catch (error: any) {
    return { error: error.message || "Failed to update risk." };
  }
}

export async function deleteRiskAction({ id, workspaceId }: { id: string, workspaceId: string }) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const risk = await prisma.risk.delete({ where: { id } });

    await createAuditLog({
      workspaceId,
      projectId: risk.projectId,
      entityId: risk.id,
      entityType: "RISK" as ENTITY_TYPE,
      action: ACTION.DELETE,
      metadata: { title: risk.title, message: `deleted risk: "${risk.title}"` }
    });

    eventEmitter.emit('invalidate');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete risk." };
  }
}