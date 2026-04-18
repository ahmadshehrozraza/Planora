"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSegmentAction } from "../server/segment-actions";

export const useDeleteSegment = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ segmentId, projectId }: { segmentId: string, projectId: string }) => {
            const response = await deleteSegmentAction(segmentId);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Segment deleted");
            queryClient.invalidateQueries({ queryKey: ["segments", variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ["segment", variables.segmentId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete Segment");
        }
    });
};