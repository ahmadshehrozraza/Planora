"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

interface UseGetProjectAnalyticsProps {
  projectId?: string;
};

export type projectAnalyticsType = InferResponseType<typeof client.api.projects[":projectId"]["analytics"]["$get"], 200>;

export const useGetProjectAnalytics = ({ projectId }: UseGetProjectAnalyticsProps) => {
  return useQuery({
    queryKey: ["project-analytics", projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("No workspaceId provided"); 

      const response = await client.api.projects[":projectId"]["analytics"].$get({
        param: { projectId }, 
      });

      if (!response.ok) {
        throw new Error("Failed to fetch project analytics");
      }

      const json = await response.json();

      if ("error" in json) {
        throw new Error(
          typeof json.error === "string" ? json.error : "Unknown error"
        );
      }

      return json.data;
    },
    enabled: !!projectId, // avoids running when undefined
  });
};
