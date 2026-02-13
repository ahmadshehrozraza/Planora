"use client";

import { useQuery } from "@tanstack/react-query";

interface UseGetWorkspaceInfoProps {
  workspaceId?: string;
}

export const useGetWorkspaceInfo = ({ workspaceId }: UseGetWorkspaceInfoProps) => {
  return useQuery({
    queryKey: ["workspace-info", workspaceId],

    queryFn: async () => {

      return null;
    },

    enabled: !!workspaceId,
  });
};
