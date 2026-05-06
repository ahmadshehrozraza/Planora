"use client";

import { useQuery } from "@tanstack/react-query";
import { getSprintAction } from "../server/get-sprint";

export const useGetSprint = (sprintId: string) => {
    return useQuery({
        queryKey: ["sprint", sprintId],
        queryFn: async () => {
            const response = await getSprintAction({ sprintId });
            return response;
        },
        enabled: !!sprintId,
    });
};