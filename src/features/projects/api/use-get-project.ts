"use client";

import { useQuery } from "@tanstack/react-query";

interface UseGetProjectProps {
  projectId?: string;
}

export const useGetProject = ({ projectId }: UseGetProjectProps) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      
      return null;
    },
    enabled: !!projectId, // avoids running when undefined
  });
};
