"use client";

import { useQuery } from "@tanstack/react-query";
import { getJoineeWorkspace } from "../server/get-joinee-workspace";

interface UseGetWorkspaceInfoProps {
  workspaceId?: string;
}

export const useGetJoineeWorkspace = ({ workspaceId }: UseGetWorkspaceInfoProps) => {
  return useQuery({
    queryKey: ["joinee-workspace", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null; 
      return await getJoineeWorkspace({ workspaceId });
    },
    enabled: !!workspaceId,
  });
};