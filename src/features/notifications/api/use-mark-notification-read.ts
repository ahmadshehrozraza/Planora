"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationReadAction } from "../server/notifications";

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: { notificationId?: string, markAll?: boolean }) => {
            const response = await markNotificationReadAction(values);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};