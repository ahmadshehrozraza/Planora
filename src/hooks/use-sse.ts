"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";

export const useSSE = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const eventSource = new EventSource('/api/stream');
        
        let debounceTimer: NodeJS.Timeout;

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("SSE Signal Received:", data);

                if (debounceTimer) clearTimeout(debounceTimer);

                debounceTimer = setTimeout(async () => {

                    await queryClient.invalidateQueries({
                        queryKey: ["tasks"],
                        exact: false, 
                    });

                    await queryClient.invalidateQueries({
                        queryKey: ["projects"],
                        exact: false,
                    });

                    await queryClient.invalidateQueries({
                        queryKey: ["notifications"],
                        exact: false,
                    });

                    await queryClient.invalidateQueries({
                        queryKey: ["workspace-members"],
                        exact: false,
                    });

                    queryClient.refetchQueries({ type: 'active' });

                    toast.info("Board updated in real-time", {
                        duration: 2000,
                        id: "sse-update",
                    });

                    console.log("Selective Cache invalidated and refetch triggered");
                }, 400);

            } catch (error) {
                console.error("Failed to parse SSE data", error);
            }
        };

        eventSource.onerror = (error) => {
            console.error("SSE Connection Lost. Reconnecting...");
        };

        return () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            eventSource.close();
        };
    }, [queryClient]);
};