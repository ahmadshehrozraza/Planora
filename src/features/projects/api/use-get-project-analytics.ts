"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectAnalyticsAction } from "../server/get-project-analytics";

export const useGetProjectAnalytics = ({ projectId }: { projectId: string }) => {
    return useQuery({
        queryKey: ["project-analytics", projectId],
        queryFn: async () => {
            const response = await getProjectAnalyticsAction({ projectId });
            if (response.error) throw new Error(response.error);
            return response.data;
        },
        enabled: !!projectId,
    });
};