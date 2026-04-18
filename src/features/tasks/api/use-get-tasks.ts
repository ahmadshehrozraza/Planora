"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getTasksAction } from "../server/get-tasks";

interface UseGetTasksProps {
    workspaceId?: string;
    projectId?: string;
    segmentId?: string;
    assigneeId?: string;
    status?: string;
    dueDate?: string;
    search?: string;
}

export const useGetTasks = (params: UseGetTasksProps) => {
    return useQuery({
        queryKey: [
            "tasks",
            params.workspaceId,
            params.projectId,
            params.segmentId,
            params.assigneeId,
            params.status,
            params.dueDate,
            params.search
        ],
        queryFn: async () => {
            const response = await getTasksAction(params);
            return response.data;
        },
        enabled: !!params.workspaceId,
        placeholderData: keepPreviousData,
    });
};