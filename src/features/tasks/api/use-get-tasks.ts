"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { TaskStatus } from "../types";

interface UseGetTasksProps {
  workspaceId?: string;
  projectId?: string | null;
  status?: TaskStatus | string | null;
  search?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export const useGetTasks = ({ 
  workspaceId,
  projectId,
  status,
  search,
  assigneeId,
  dueDate,
}: UseGetTasksProps) => {

  return useQuery({
    queryKey: [
      "tasks", 
       workspaceId,
       projectId,
       status,
       search,
       assigneeId,
       dueDate,
      ],
    queryFn: async () => {
      if (!workspaceId) throw new Error("No workspaceId provided"); // ✅ ensures type safety

      const response = await client.api.tasks.$get({
        query: { 
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          assigneeId: assigneeId === null ? "no-assignee" : assigneeId,
          search: search ?? undefined,
          dueDate: dueDate ?? undefined,
        }, // now always a string
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const json = await response.json();

      return json.data;
    },
    enabled: !!workspaceId, // avoids running when undefined
  });
};
