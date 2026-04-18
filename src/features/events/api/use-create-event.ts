"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createEventAction } from "../server/create-event";
import { z } from "zod";
import { createEventSchema } from "../schemas";

export const useCreateEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: z.infer<typeof createEventSchema>) => {
            const response = await createEventAction(values);
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data;
        },
        onSuccess: (data, variables) => {
            toast.success("Event created successfully");
            queryClient.invalidateQueries({ queryKey: ["events", variables.workspaceId] });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create event");
        }
    });
};