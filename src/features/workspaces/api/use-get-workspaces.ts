"use client";

import { useQuery } from "@tanstack/react-query";
import { getWorkspaces } from "../server/get-workspaces"; 

export const useGetWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"], 
    queryFn: () => getWorkspaces(),
  });
};