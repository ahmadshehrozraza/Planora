"use client";

import { useQuery  } from "@tanstack/react-query";

export const useGetWorkspaces = () => {
    const query  = useQuery({
        queryKey: ["workspaces"],
        queryFn: async () => {
            
            return null;
        },
    });

    return query;
}