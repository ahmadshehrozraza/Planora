"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

interface UseGetWorkspaceAnalyticsProps {
  workspaceId?: string;
};

export type workspaceAnalyticsType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["analytics"]["$get"], 200>;

export const useGetWorkspaceAnalytics = ({ workspaceId }: UseGetWorkspaceAnalyticsProps) => {
  return useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: async () => {
      if (!workspaceId) throw new Error("No workspaceId provided"); 

      const response = await client.api.workspaces[":workspaceId"]["analytics"].$get({
        param: { workspaceId }, 
      });

      if (!response.ok) {
        throw new Error("Failed to fetch workspace analytics");
      }

      const json = await response.json();

      if ("error" in json) {
        throw new Error(
          typeof json.error === "string" ? json.error : "Unknown error"
        );
      }

      return json.data;
    },
    enabled: !!workspaceId, // avoids running when undefined
  });
};
