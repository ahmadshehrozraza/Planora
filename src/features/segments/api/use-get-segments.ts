"use client";

import { useQuery } from "@tanstack/react-query";
import { getSegmentsAction } from "../server/get-segments";

export const useGetSegments = (projectId: string) => {
    return useQuery({
        queryKey: ["segments", projectId],
        queryFn: async () => {
            const response = await getSegmentsAction(projectId);
            return response;
        },
        enabled: !!projectId,
    });
};