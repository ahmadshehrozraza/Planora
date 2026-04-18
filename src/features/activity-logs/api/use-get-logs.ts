"use client";

import { useQuery } from "@tanstack/react-query";
import { getActivityLogsAction } from "../server/get-logs";
import { ENTITY_TYPE } from "../types";

interface UseGetLogsProps {
    workspaceId: string;
    projectId?: string;
    entityId?: string;
    entityType?: ENTITY_TYPE;
}

export const useGetLogs = ({ workspaceId, projectId, entityId, entityType }: UseGetLogsProps) => {
    return useQuery({
        queryKey: ["activity-logs", workspaceId, projectId, entityId, entityType],
        queryFn: async () => {
            const response = await getActivityLogsAction({ workspaceId, projectId, entityId, entityType });
            if (response.error) throw new Error(response.error);
            return response.data;
        },
    });
};