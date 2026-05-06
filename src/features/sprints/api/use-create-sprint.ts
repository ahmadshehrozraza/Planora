"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSprintAction } from "../server/create-sprint";
import { useRouter } from "next/navigation";

export const useCreateSprint = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (values: any) => {
            const response = await createSprintAction(values);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Sprint created successfully");
            queryClient.invalidateQueries({ queryKey: ["sprints", variables.projectId] });

            if (data?.data?.id) {
                router.push(`/workspaces/${variables.workspaceId}/projects/${variables.projectId}/sprints/${data.data.id}`);
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Network Error: Failed to create Sprint");
        }
    });
};