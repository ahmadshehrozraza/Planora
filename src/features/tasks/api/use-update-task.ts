"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTaskAction } from "../server/update-task";
import { bulkUpdateTasksOrder } from "../server/bulk-update-tasks";

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: any) => {
            const response = await updateTaskAction(values);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Task updated successfully");
            queryClient.invalidateQueries({ queryKey: ["tasks", variables.workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update task");
        }
    });
};

export const useReorderTasks = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: any) => {
            const response = await bulkUpdateTasksOrder(values);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to reorder tasks");
        }
    });
};