"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../server/get-projects";

interface UseGetProjectsProps {
  workspaceId?: string;
}

export const useGetProjects = ({ workspaceId }: UseGetProjectsProps) => {
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      return await getProjects({ workspaceId });
    },
    enabled: !!workspaceId,
  });
};