"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSprintAction } from "../server/sprint-actions";

export const useDeleteSprint = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ sprintId, projectId }: { sprintId: string, projectId: string }) => {
            const response = await deleteSprintAction(sprintId);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Sprint deleted");
            queryClient.invalidateQueries({ queryKey: ["sprints", variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ["sprint", variables.sprintId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete Sprint");
        }
    });
};