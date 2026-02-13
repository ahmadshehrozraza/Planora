"use client";

import { useQuery  } from "@tanstack/react-query";

interface UseGetMembersProps {
    workspaceId: string;
}

export const useGetMembers = ({
    workspaceId,
}: UseGetMembersProps) => {
    const query  = useQuery({
        queryKey: ["members", workspaceId],
        queryFn: async () => {

            return null;
        },
    });

    return query;
}