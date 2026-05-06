"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { resetProjectRoleInviteCodeAction } from "../server/project-roles-action";

export const useResetProjectRoleInviteCode = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ roleId, projectId, workspaceId }: { roleId: string, projectId: string, workspaceId: string }) => {
            const response = await resetProjectRoleInviteCodeAction(roleId, projectId, workspaceId);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success("Invite link reset successfully");
            queryClient.invalidateQueries({ queryKey: ["project-roles", variables.projectId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to reset invite link");
        }
    });
};