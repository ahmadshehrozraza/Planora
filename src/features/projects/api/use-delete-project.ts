"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProjectAction } from "../server/project-actions";

export const useDeleteProject = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ projectId, workspaceId }: { projectId: string, workspaceId: string }) => {
            const response = await deleteProjectAction(projectId);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Project deleted");
            queryClient.invalidateQueries({ queryKey: ["projects", variables.workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["project", variables.projectId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete Project");
        }
    });
};