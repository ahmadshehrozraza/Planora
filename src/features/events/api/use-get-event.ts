"use client";

import { useQuery } from "@tanstack/react-query";
import { getEventAction } from "../server/get-event";

export const useGetEvent = ({ eventId }: { eventId: string }) => {
    return useQuery({
        queryKey: ["event", eventId],
        queryFn: async () => {
            const response = await getEventAction({ eventId });
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data;
        },
        enabled: !!eventId,
        retry: false,
    });
};