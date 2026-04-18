"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMemberAction } from "../server/members-actions";

export const useDeleteMember = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ memberId, workspaceId }: { memberId: string, workspaceId: string }) => {
            const response = await deleteMemberAction({ memberId });
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Member deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["members", variables.workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["member-profile", variables.workspaceId, variables.memberId] });
            queryClient.invalidateQueries({ queryKey: ["project-members"] });
            queryClient.invalidateQueries({ queryKey: ["tasks", variables.workspaceId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Network Error: Failed to delete member");
        }
    });
};