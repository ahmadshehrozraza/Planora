"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserPreferences, updateUserPreferences } from "../server/user-preferences";
import { toast } from "sonner";

export const useGetPreferences = () => {
    return useQuery({
        queryKey: ["user-preferences"],
        queryFn: async () => {
            const data = await getUserPreferences();
            return data;
        }
    });
};

export const useUpdatePreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { theme?: string; sidebarExpanded?: boolean; lastWorkspaceId?: string }) => {
            const response = await updateUserPreferences(data);
            if (response.error) throw new Error(response.error);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update preferences");
        }
    });
};