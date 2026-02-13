"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetWorkspaceProps {
  workspaceId?: string;
}

export const useGetWorkspace = ({ workspaceId }: UseGetWorkspaceProps) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],

    queryFn: async () => {
      if (!workspaceId) throw new Error("No workspaceId provided");

      const response = await client.api.workspaces[":workspaceId"].$get({
        param: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch workspace");
      }

      const json = await response.json();

      if ("error" in json) {
        throw new Error(
          typeof json.error === "string" ? json.error : "Unknown error"
        );
      }

      return json.data;
    },

    enabled: !!workspaceId,
  });
};
