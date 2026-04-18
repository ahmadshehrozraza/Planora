"use client";

import { useQuery } from "@tanstack/react-query";
import { getEventsAction } from "../server/get-events";

interface UseGetEventsProps {
    workspaceId: string;
    projectId?: string | null;
    segmentId?: string | null;
}

export const useGetEvents = ({ workspaceId, projectId, segmentId }: UseGetEventsProps) => {
    return useQuery({
        queryKey: ["events", workspaceId, projectId, segmentId],
        queryFn: async () => {
            const response = await getEventsAction({ workspaceId, projectId, segmentId });
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data || [];
        },
        enabled: !!workspaceId, 
        retry: false,
    });
};