import { useQuery } from "@tanstack/react-query";
import { getProjects, getProject } from "@/features/projects/server/get-projects";
import { DummyProject } from "@/features/projects/types";

// Types
interface ProjectsResponse {
  documents: DummyProject[];
  total: number;
}

interface SingleProjectResponse {
  document: DummyProject;
}

// ------------------------------------------------------------------
// HOOK 1: Get Projects (Handles both "All" and "By Workspace")
// ------------------------------------------------------------------
export const useGetDummyProjects = (workspaceId?: string) => {
  return useQuery<ProjectsResponse>({
    // Cache Key: Agar workspaceId hai to alag cache, nahi hai to 'all' cache
    queryKey: ["dummy-projects", workspaceId || "all"],
    
    queryFn: async () => {
      // Server Action call (workspaceId optional hai)
      const data = await getProjects({ workspaceId });

      return {
        documents: data,
        total: data.length,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ------------------------------------------------------------------
// HOOK 2: Get Single Project by ID
// ------------------------------------------------------------------
export const useGetDummyProject = (projectId?: string) => {
  return useQuery<SingleProjectResponse>({
    queryKey: ["dummy-project", projectId],
    
    queryFn: async () => {
      if (!projectId) throw new Error("ProjectId is required");

      // Server Action call for SINGLE item
      const data = await getProject({ projectId });

      if (!data) {
        throw new Error("Project not found");
      }

      return {
        document: data,
      };
    },
    enabled: !!projectId, // Jab tak ID na mile, query mat chalao
    staleTime: 5 * 60 * 1000,
  });
};