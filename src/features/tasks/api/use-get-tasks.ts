"use client";

import { useQuery } from "@tanstack/react-query";

import { TaskStatus } from "../types";



export const useGetTasks = () => {

  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      
      return null;
      
    },
  });
};
