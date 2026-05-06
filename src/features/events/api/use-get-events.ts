"use client";

import { useQuery } from "@tanstack/react-query";
import { getEventsAction } from "../server/get-events";

interface UseGetEventsProps {
    workspaceId: string;
    projectId?: string | null;
    sprintId?: string | null;
}

export const useGetEvents = ({ workspaceId, projectId, sprintId }: UseGetEventsProps) => {
    return useQuery({
        queryKey: ["events", workspaceId, projectId, sprintId],
        queryFn: async () => {
            const response = await getEventsAction({ workspaceId, projectId, sprintId });
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data || [];
        },
        enabled: !!workspaceId, 
        retry: false,
    });
};