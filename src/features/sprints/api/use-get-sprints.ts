"use client";

import { useQuery } from "@tanstack/react-query";
import { getSprintsAction } from "../server/get-sprints";

export const useGetSprints = (projectId: string) => {
    return useQuery({
        queryKey: ["sprints", projectId],
        queryFn: async () => {
            if (!projectId) return [];
            try {
                const response = await getSprintsAction(projectId);
                return response || [];
            } catch (error) {
                return [];
            }
        },
        enabled: !!projectId,
    });
};