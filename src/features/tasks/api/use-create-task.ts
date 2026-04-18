"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTaskAction } from "../server/create-task";

export const useCreateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: any) => {
            const response = await createTaskAction(values);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Task created successfully");
            queryClient.invalidateQueries({ queryKey: ["tasks", variables.workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create task");
        }
    });
};