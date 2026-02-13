"use client";

import { useQuery } from "@tanstack/react-query";

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
      
      return null;

    },
  });
};
