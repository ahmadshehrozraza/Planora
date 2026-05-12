"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { eventEmitter } from "@/lib/event-emitter";

interface UpdateEstimationProps {
  projectId: string;
  workspaceId: string;
  estimatedKloc: number;
  calculatedEffort: number;
  calculatedCost: number;
  avgResourceCost: number;
  fpaMetadata: any;
}

export async function updateProjectEstimations(values: UpdateEstimationProps) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const project = await prisma.project.update({
      where: { id: values.projectId },
      data: {
        estimatedKloc: values.estimatedKloc,
        calculatedEffort: values.calculatedEffort,
        calculatedCost: values.calculatedCost,
        avgResourceCost: values.avgResourceCost,
        fpaMetadata: values.fpaMetadata,
      }
    });

    await createAuditLog({
      workspaceId: values.workspaceId,
      projectId: values.projectId,
      entityId: values.projectId,
      entityType: ENTITY_TYPE.PROJECT,
      action: ACTION.UPDATE,
      metadata: { 
        title: project.name, 
        message: `Updated AI project estimations (KLOC: ${values.estimatedKloc})` 
      }
    });

    eventEmitter.emit('invalidate');
    return { success: true, data: project };
  } catch (error: any) {
    return { error: error.message || "Failed to update estimations." };
  }
}