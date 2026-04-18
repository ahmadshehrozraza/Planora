"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteEventAction } from "../server/delete-event";

export const useDeleteEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ eventId, workspaceId }: { eventId: string, workspaceId: string }) => {
            const response = await deleteEventAction({ eventId });
            if (response.error) throw new Error(response.error);
            return { workspaceId, eventId };
        },
        onSuccess: ({ workspaceId, eventId }) => {
            toast.success("Event deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["events", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete event");
        }
    });
};