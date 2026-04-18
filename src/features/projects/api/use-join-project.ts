"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { joinProjectAction } from "../server/join-project";

export const useJoinProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: { projectId: string; workspaceId: string; inviteCode: string }) => {
            const response = await joinProjectAction(values);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success("Successfully joined the project!");
            queryClient.invalidateQueries({ queryKey: ["projects", variables.workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["project-members", variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ["workspace-members", variables.workspaceId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to join project.");
        }
    });
};