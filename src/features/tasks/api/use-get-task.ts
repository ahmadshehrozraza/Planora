"use client";

import { useQuery } from "@tanstack/react-query";
import { getTaskAction } from "../server/get-task";

interface UseGetTaskProps {
    taskId: string;
}

export const useGetTask = ({ taskId }: UseGetTaskProps) => {
    return useQuery({
        queryKey: ["task", taskId],
        queryFn: async () => {
            const response = await getTaskAction(taskId);
            return response.data;
        },
        enabled: !!taskId,
    });
};