import { z } from "zod";

export const workspaceRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters").max(50),
  workspaceId: z.string(),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
});

export const updateWorkspaceRoleSchema = workspaceRoleSchema.extend({
  id: z.string(),
});


export const projectRoleSchema = z.object({
    name: z.string().min(2, "Role name must be at least 2 characters"),
    workspaceId: z.string(),
    projectId: z.string(),
    permissions: z.array(z.string()),
});