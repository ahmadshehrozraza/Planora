"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSegmentAction } from "../server/segment-actions";

export const useUpdateSegment = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ segmentId, projectId, values }: { segmentId: string, projectId: string, values: any }) => {
            const response = await updateSegmentAction(segmentId, values);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Segment updated");
            queryClient.invalidateQueries({ queryKey: ["segments", variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ["segment", variables.segmentId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update Segment");
        }
    });
};