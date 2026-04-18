"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateEventAction } from "../server/update-event";
import { z } from "zod";
import { createEventSchema } from "../schemas";

export const useUpdateEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ eventId, json }: { eventId: string, json: z.infer<typeof createEventSchema> }) => {
            const response = await updateEventAction({ eventId, values: json });
            if (response.error) throw new Error(response.error);
            return response.data;
        },
        onSuccess: (data, variables) => {
            toast.success("Event updated successfully");
            queryClient.invalidateQueries({ queryKey: ["events", variables.json.workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] }); 
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update event");
        }
    });
};