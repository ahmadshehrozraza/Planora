"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetProjectProps {
  projectId?: string;
}

export const useGetProject = ({ projectId }: UseGetProjectProps) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("No workspaceId provided"); 

      const response = await client.api.projects[":projectId"].$get({
        param: { projectId }, 
      });

      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }

      const json = await response.json();

      if ("error" in json) {
        throw new Error(json.error);
      }

      return json.data;
    },
    enabled: !!projectId, // avoids running when undefined
  });
};
