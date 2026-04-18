"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSegmentAction } from "../server/create-segment";
import { useRouter } from "next/navigation";

export const useCreateSegment = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (values: any) => {
            const response = await createSegmentAction(values);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Segment created successfully");
            queryClient.invalidateQueries({ queryKey: ["segments", variables.projectId] });

            if (data?.data?.id) {
                router.push(`/workspaces/${variables.workspaceId}/projects/${variables.projectId}/segments/${data.data.id}`);
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Network Error: Failed to create Segment");
        }
    });
};