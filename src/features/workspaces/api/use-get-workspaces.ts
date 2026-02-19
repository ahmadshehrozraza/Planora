import { useQuery } from "@tanstack/react-query";
import { getWorkspaces } from "../server/useGetWorkspace";

export const useGetWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
        const data = await getWorkspaces(); 
        return data;
    },
    staleTime: 60 * 1000, 
  });
};