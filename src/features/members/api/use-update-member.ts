"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMemberAction } from "../server/members-actions";

export const useUpdateMember = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ memberId, role, workspaceId }: { memberId: string, role: string, workspaceId: string }) => {
            const response = await updateMemberAction({ memberId, role });
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Member updated successfully");
            queryClient.invalidateQueries({ queryKey: ["members", variables.workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["member-profile", variables.workspaceId, variables.memberId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Network Error: Failed to update member");
        }
    });
};