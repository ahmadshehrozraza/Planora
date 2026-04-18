"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkspaceAction } from "../server/workspace-actions"; 

export const useDeleteWorkspace = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ workspaceId }: { workspaceId: string }) => {
            const response = await deleteWorkspaceAction(workspaceId);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success);
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            queryClient.invalidateQueries({ queryKey: ["workspace", variables.workspaceId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete Workspace");
        }
    });
};