"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bulkUpdateTasksOrder } from "../server/bulk-update-tasks";

export const useBulkUpdateTasks = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (tasks: { id: string; columnId: string; position: number }[]) => {
            const response = await bulkUpdateTasksOrder(tasks);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
            toast.success("Tasks updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update task positions");
        }
    });
};