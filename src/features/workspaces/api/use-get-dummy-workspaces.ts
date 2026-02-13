
"use client";

import { useQuery } from "@tanstack/react-query";
import { DummyWorkspace } from "../types";
import { dummyWorkspaces } from "../dummy-workspaces";


interface DummyWorkspacesResponse {
  documents: DummyWorkspace[];
  total: number;
  success: boolean;
}

interface DummyWorkspaceResponse {
  document: DummyWorkspace;
  success: boolean;
}


export const useGetDummyWorkspaces = () => {
  return useQuery<DummyWorkspacesResponse>({
    queryKey: ["dummy-workspaces"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        documents: dummyWorkspaces,
        total: dummyWorkspaces.length,
        success: true
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

interface ApiResponse<T> {
  document: T;
  success: boolean;
  message?: string;
}

export const useGetDummyWorkspace = (workspaceId?: string) => {
  return useQuery<ApiResponse<DummyWorkspace>>({
    queryKey: ["dummy-workspace", workspaceId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));

      if (!workspaceId) {
        throw new Error("No workspaceId provided");
      }

      const workspace = dummyWorkspaces.find(w => w.id === workspaceId);

      if (!workspace) {
        throw new Error("Workspace not found");
      }

      return {
        document: workspace,
        success: true
      };
    },
    enabled: !!workspaceId,
  });
};