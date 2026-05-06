"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectMembersAction } from "../server/get-project-members";

export const useGetProjectMembers = (projectId?: string) => {
    return useQuery({
        queryKey: ["project-members", projectId],
        queryFn: async () => {
            if (!projectId) return { data: [] };
            try {
                const response = await getProjectMembersAction(projectId);
                return response || { data: [] };
            } catch (error) {
                return { data: [] };
            }
        },
        enabled: !!projectId,
    });
};