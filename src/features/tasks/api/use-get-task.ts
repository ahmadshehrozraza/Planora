"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { TaskStatus } from "../types";

interface UseGetTaskProps {
  taskId: string;
}

export const useGetTask = ({ 
  taskId,
}: UseGetTaskProps) => {

  return useQuery({
    queryKey: [
      "task", 
       taskId,
      ],
    queryFn: async () => {
      const response = await client.api.tasks[":taskId"].$get({
        param: { taskId }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch task");
      }

      const json = await response.json();

      return json.data;
    },
  });
};
