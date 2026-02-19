"use server";

import { dummyProjects } from "../dummyProjects";

interface GetProjectsArgs {
  workspaceId?: string; // Optional kar diya (taake "Get All" bhi chale)
}

interface GetProjectArgs {
  projectId: string;
}

// 1. Get List (All or By Workspace)
export const getProjects = async ({ workspaceId }: GetProjectsArgs = {}) => {
  // Simulate delay removed for speed
  
  if (workspaceId) {
    return dummyProjects.filter((p) => p.workspaceId === workspaceId);
  }
  
  // Agar workspaceId nahi bheja, to SAARAY projects return karo
  return dummyProjects; 
};

// 2. Get Single Project by ID
export const getProject = async ({ projectId }: GetProjectArgs) => {
  const project = dummyProjects.find((p) => p.id === projectId);
  return project || null;
};