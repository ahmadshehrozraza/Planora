"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";

export const useSSE = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const eventSource = new EventSource('/api/stream');
        
        eventSource.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false }),
                    queryClient.invalidateQueries({ queryKey: ["projects"], exact: false }),
                    queryClient.invalidateQueries({ queryKey: ["notifications"], exact: false }),
                    queryClient.invalidateQueries({ queryKey: ["workspace-members"], exact: false }),
                    queryClient.invalidateQueries({ queryKey: ["comments"], exact: false })
                ]);

                toast.info("Board updated", {
                    duration: 2000,
                    id: "sse-update",
                });
            } catch (error) {
                console.error(error);
            }
        };

        eventSource.onerror = () => {
            console.error("SSE Error");
        };

        return () => {
            eventSource.close();
        };
    }, [queryClient]);
};