"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSprintAction } from "../server/sprint-actions";

export const useUpdateSprint = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ sprintId, projectId, values }: { sprintId: string, projectId: string, values: any }) => {
            const response = await updateSprintAction(sprintId, values);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Sprint updated");
            queryClient.invalidateQueries({ queryKey: ["sprints", variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ["sprint", variables.sprintId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update Sprint");
        }
    });
};