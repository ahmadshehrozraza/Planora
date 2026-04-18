"use client";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceById } from "../server/get-workpace-id"; 

interface UseGetWorkspaceProps {
  workspaceId: string;
}

export const useGetWorkspace = ({ workspaceId }: UseGetWorkspaceProps) => {
  return useQuery({
    queryKey: ["workspace", workspaceId], 
    queryFn: async () => {
        return await getWorkspaceById({ workspaceId });
    },
    enabled: !!workspaceId,
  });
};