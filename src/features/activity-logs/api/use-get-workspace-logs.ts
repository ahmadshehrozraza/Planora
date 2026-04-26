import { useQuery } from "@tanstack/react-query";
import { getWorkspaceLogsAction } from "../server/get-workspace-logs";

export const useGetWorkspaceLogs = (workspaceId: string) => {
    return useQuery({
        queryKey: ["workspace-logs", workspaceId],
        queryFn: async () => {
            const response = await getWorkspaceLogsAction({ workspaceId });
            if (response.error) throw new Error(response.error);
            return response.data;
        },
    });
};