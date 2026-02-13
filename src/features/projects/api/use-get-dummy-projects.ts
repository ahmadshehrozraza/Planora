"use client";

import { useQuery } from "@tanstack/react-query";
import {  dummyProjects } from "../dummyProjects";
import { DummyProject } from "../types";

// Type for API response
interface DummyProjectsResponse {
  documents: DummyProject[];
  total: number;
  success: boolean;
}

interface DummyProjectResponse {
  document: DummyProject;
  success: boolean;
}

// Get all projects or filter by workspaceId
export const useGetDummyProjects = (workspaceId?: string) => {
  return useQuery<DummyProjectsResponse>({
    queryKey: ["dummy-projects", workspaceId],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter projects by workspaceId if provided
      let filteredProjects = dummyProjects;
      if (workspaceId) {
        filteredProjects = dummyProjects.filter(project => project.workspaceId === workspaceId);
      }
      
      return {
        documents: filteredProjects,
        total: filteredProjects.length,
        success: true
      };
    },
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
};

// Get single project by ID
export const useGetDummyProject = (projectId?: string) => {
  return useQuery<DummyProjectResponse>({
    queryKey: ["dummy-project", projectId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!projectId) {
        throw new Error("No projectId provided");
      }

      const project = dummyProjects.find(p => p.id === projectId);
      
      if (!project) {
        throw new Error("Project not found");
      }

      return {
        document: project,
        success: true
      };
    },
    enabled: !!projectId,
  });
};