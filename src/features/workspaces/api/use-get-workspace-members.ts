"use client";

import { useQuery } from "@tanstack/react-query";
import { getWorkspaceMembersAction } from "../server/get-workspace-members";

export const useGetWorkspaceMembers = (workspaceId: string) => {
    return useQuery({
        queryKey: ["members", workspaceId],
        queryFn: () => getWorkspaceMembersAction(workspaceId),
        enabled: !!workspaceId,
    });
};