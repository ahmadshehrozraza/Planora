"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinWorkspaceAction } from "../server/join-workspace"; 
import { useRouter } from "next/navigation";

export const useJoinWorkspace = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async ({ workspaceId, inviteCode }: { workspaceId: string, inviteCode: string }) => {
            const response = await joinWorkspaceAction({ workspaceId, inviteCode });
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success);
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            queryClient.invalidateQueries({ queryKey: ["workspace", variables.workspaceId] });
            
            if (data?.data?.id) {
                router.push(`/workspaces/${data.data.id}`);
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to join workspace");
        }
    });
};