"use client";

import { useQuery } from "@tanstack/react-query";
import { DummyWorkspace } from "../types"; // Apni types file ka path verify kar lijiye ga
import { dummyWorkspaces } from "../dummy-workspaces";


interface UseGetWorkspaceProps {
  workspaceId: string;
}

export const useGetWorkspace = ({ workspaceId }: UseGetWorkspaceProps) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],

    queryFn: async (): Promise<DummyWorkspace> => {

      await new Promise((resolve) => setTimeout(resolve, 300));

      const workspace = dummyWorkspaces.find((ws) => ws.id === workspaceId);

      if (!workspace) {
        throw new Error("Workspace not found");
      }

      return workspace;
    },

    enabled: !!workspaceId, 
    staleTime: 5 * 60 * 1000, 
    retry: 1,
  });
};