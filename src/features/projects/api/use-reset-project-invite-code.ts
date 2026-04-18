"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { resetProjectInviteCodeAction } from "../server/reset-project-invite-code";

export const useResetProjectInviteCode = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: { projectId: string, workspaceId: string }) => {
            const response = await resetProjectInviteCodeAction(values);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Invite link reset successfully!");
            queryClient.invalidateQueries({ queryKey: ["project", variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ["projects", variables.workspaceId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to reset invite link");
        }
    });
};