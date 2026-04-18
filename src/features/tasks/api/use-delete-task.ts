"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTaskAction } from "../server/delete-task";

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (taskId: string) => {
            const response = await deleteTaskAction(taskId);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, taskId) => {
            toast.success(data.success || "Task deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["task", taskId] });
            queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete task");
        }
    });
};