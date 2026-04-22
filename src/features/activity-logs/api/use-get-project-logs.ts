import { useQuery } from "@tanstack/react-query";
import { getProjectLogsAction } from "../server/get-project-logs";

export const useGetProjectLogs = (projectId: string) => {
    return useQuery({
        queryKey: ["project-logs", projectId],
        queryFn: async () => {
            const res = await getProjectLogsAction({ projectId });
            if (res.error) throw new Error(res.error);
            return res.data;
        },
    });
};