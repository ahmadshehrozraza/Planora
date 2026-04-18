"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectMembersAction } from "../server/get-project-members";

export const useGetProjectMembers = ({ projectId }: { projectId: string }) => {
    return useQuery({
        queryKey: ["project-members", projectId],
        queryFn: async () => {
            const response = await getProjectMembersAction({ projectId });
            if (response.error) throw new Error(response.error);
            return response;
        },
        enabled: !!projectId,
    });
};