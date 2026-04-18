"use client";

import { useQuery } from "@tanstack/react-query";
import { getProject } from "../server/get-project"; 

interface UseGetProjectProps {
  projectId: string;
}

export const useGetProject = ({ projectId }: UseGetProjectProps) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await getProject({ projectId });
      if (!response) throw new Error("Project not found");
      return response;
    },
    enabled: !!projectId,
  });
};