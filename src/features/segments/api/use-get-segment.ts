"use client";

import { useQuery } from "@tanstack/react-query";
import { getSegmentAction } from "../server/get-segment";

export const useGetSegment = (segmentId: string) => {
    return useQuery({
        queryKey: ["segment", segmentId],
        queryFn: async () => {
            const response = await getSegmentAction({ segmentId });
            return response;
        },
        enabled: !!segmentId,
    });
};