"use client";

import { useQuery } from "@tanstack/react-query";

interface UseGetWorkspaceProps {
  workspaceId?: string;
}

export const useGetWorkspace = ({ workspaceId }: UseGetWorkspaceProps) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],

    queryFn: async () => {
      return null;
    },

    enabled: !!workspaceId,
  });
};
