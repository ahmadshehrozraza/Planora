"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../server/get-dashboard-stats";

interface UseGetDashboardStatsProps {
    workspaceId: string;
}

export const useGetDashboardStats = ({ workspaceId }: UseGetDashboardStatsProps) => {
    return useQuery({
        queryKey: ["dashboard-stats", workspaceId],
        queryFn: async () => {
            const data = await getDashboardStats({ workspaceId });
            if (!data) throw new Error("Failed to fetch dashboard stats");
            return data;
        },
        enabled: !!workspaceId,
    });
};