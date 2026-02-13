"use client";

import { useQuery } from "@tanstack/react-query";

interface UseGetProjectsProps {
  workspaceId?: string;
}

export const useGetProjects = ({ workspaceId }: UseGetProjectsProps) => {
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      

      return null;
    },
    enabled: !!workspaceId, // avoids running when undefined
  });
};
