"use client";

import { useQuery } from "@tanstack/react-query";
import { getWorkspaceMemberProfile } from "../server/get-workspace-member-profile";

export const useGetWorkspaceMemberProfile = ({ workspaceId, memberId }: { workspaceId: string, memberId: string }) => {
    return useQuery({
        queryKey: ["member-profile", workspaceId, memberId],
        queryFn: async () => {
            const response = await getWorkspaceMemberProfile({ workspaceId, memberId });
            if (response.error) throw new Error(response.error);
            return response.data;
        },
        enabled: !!workspaceId && !!memberId,
    });
};