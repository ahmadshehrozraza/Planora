"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinWorkspaceAction } from "../server/join-workspace"; 

export const useJoinWorkspace = () => {
    const queryClient = useQueryClient();
    // 🚨 useRouter yahan se hata diya hai

    return useMutation({
        mutationFn: async ({ workspaceId, inviteCode, roleToken }: { workspaceId: string, inviteCode: string, roleToken?: string }) => {
            const response = await joinWorkspaceAction({ workspaceId, inviteCode, roleToken });
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success as string);
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            queryClient.invalidateQueries({ queryKey: ["workspace", variables.workspaceId] });
        },
        onError: (error: Error) => { 
            toast.error(error.message || "Failed to join workspace");
        }
    });
};