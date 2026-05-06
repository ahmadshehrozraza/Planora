"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { resetWorkspaceRoleInviteCodeAction } from "../server/workspace-roles-action";

export const useResetWorkspaceRoleInviteCode = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ roleId, workspaceId }: { roleId: string, workspaceId: string }) => {
            const response = await resetWorkspaceRoleInviteCodeAction(roleId, workspaceId);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success("Invite link reset successfully");
            queryClient.invalidateQueries({ queryKey: ["workspace-roles", variables.workspaceId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to reset invite link");
        }
    });
};