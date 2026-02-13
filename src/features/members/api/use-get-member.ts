"use client";

import { useQuery } from "@tanstack/react-query";
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

            
            return null;
        },
        enabled: !!workspaceId && !!userId, 
    });

    return query;
};