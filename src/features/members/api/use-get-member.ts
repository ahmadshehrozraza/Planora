"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { Member } from "../types";

interface UseGetMemberProps {
    workspaceId: string;
    userId?: string;
}

export const useGetMember = ({
    workspaceId,
    userId,
}: UseGetMemberProps) => {
    const query = useQuery({
        queryKey: ["member", workspaceId, userId],
        queryFn: async () => {

            if (!userId) {
                throw new Error("User ID is required");
            }

            const response = await client.api.members.single.$get({ query: { workspaceId, userId }});

            if (!response.ok) {
                throw new Error("Failed to fetch member");
            }

            const { data } = await response.json();
            return data as Member;
        },
        enabled: !!workspaceId && !!userId, 
    });

    return query;
};