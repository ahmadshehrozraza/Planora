"use client";

import { useQuery } from "@tanstack/react-query";
import { getPermissions } from "@/lib/get-permissions"; 

export const useGetPermissions = (workspaceId: string, projectId?: string | null) => {
    return useQuery({
        queryKey: ["permissions", workspaceId, projectId],
        queryFn: async () => {
            const data = await getPermissions({ workspaceId, projectId });
            return data; 
        },
        enabled: !!workspaceId && workspaceId !== "undefined",
    });
};