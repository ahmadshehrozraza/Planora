"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getProjectColumnsAction } from "../server/get-project-columns";

export const useGetProjectColumns = (projectId?: string) => {
    return useQuery({
        queryKey: ["columns", projectId],
        queryFn: async () => {
            if (!projectId) return [];
            return await getProjectColumnsAction(projectId);
        },
        enabled: !!projectId,
        placeholderData: keepPreviousData,
    });
};