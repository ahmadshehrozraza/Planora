"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { Project } from "../types";

interface UseGetProjectsProps {
  workspaceId?: string;
}

export const useGetProjects = ({ workspaceId }: UseGetProjectsProps) => {
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      if (!workspaceId) throw new Error("No workspaceId provided"); 

      const response = await client.api.projects.$get({
        query: { workspaceId }, 
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const json = await response.json();

      if ("error" in json) {
        // throw new Error(json.error);
      }

      return json.data;
    },
    enabled: !!workspaceId, // avoids running when undefined
  });
};
