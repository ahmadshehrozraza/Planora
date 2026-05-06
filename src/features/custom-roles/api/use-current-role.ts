"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentRoleAction } from "../server/get-current-role-action";

export const useCurrentRole = (workspaceId: string, projectId?: string | null) => {
    return useQuery({
        queryKey: ["current-role", workspaceId, projectId],
        queryFn: async () => {
            const res = await getCurrentRoleAction({ workspaceId, projectId });
            return res.data;
        },
        enabled: !!workspaceId && workspaceId !== "undefined",
    });
};