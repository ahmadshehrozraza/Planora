import { z } from "zod";
import { RiskLevel, RiskStatus } from "@prisma/client";

export const createRiskSchema = z.object({
  title: z.string().min(1, "Risk title is required"),
  probability: z.nativeEnum(RiskLevel).default(RiskLevel.MEDIUM),
  impact: z.nativeEnum(RiskLevel).default(RiskLevel.MEDIUM),
  mitigation: z.string().optional().nullable(),
  status: z.nativeEnum(RiskStatus).default(RiskStatus.OPEN),
  projectId: z.string().min(1, "Project ID is required"),
  workspaceId: z.string().min(1, "Workspace ID is required"),
});

export const updateRiskSchema = createRiskSchema.partial().extend({
  id: z.string().min(1, "Risk ID is required"),
  workspaceId: z.string().min(1, "Workspace ID is required"), // Needed for permission check
});