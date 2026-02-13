// src/features/segments/api/use-get-dummy-segments.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { dummySegments } from "../hooks/dummy-segments";
import { DummySegment } from "../types";

// 1. Get segments by project ID
export const useGetDummySegmentsByProject = (projectId?: string) => {
  return useQuery({
    queryKey: ["dummy-segments-by-project", projectId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      if (!projectId) {
        throw new Error("No projectId provided");
      }

      const projectSegments = dummySegments.filter(
        segment => segment.projectId === projectId
      );
      
      return {
        documents: projectSegments,
        total: projectSegments.length,
        success: true
      };
    },
    enabled: !!projectId,
  });
};

// 2. Get single segment by ID
export const useGetDummySegment = (segmentId?: string) => {
  return useQuery({
    queryKey: ["dummy-segment", segmentId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!segmentId) {
        throw new Error("No segmentId provided");
      }

      const segment = dummySegments.find(s => s.id === segmentId);
      
      if (!segment) {
        throw new Error("Segment not found");
      }

      return {
        document: segment,
        success: true
      };
    },
    enabled: !!segmentId,
  });
};