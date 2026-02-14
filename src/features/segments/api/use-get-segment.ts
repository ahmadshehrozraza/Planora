import { useQuery } from "@tanstack/react-query";
import { dummySegments } from "../hooks/dummy-segments";
import { DummySegment } from "../types";

interface UseGetSegmentsOptions {
  status?: string;
}

export const useGetSegment = (segmentId: string) => {
  return useQuery({
    queryKey: ["segment", segmentId],
    queryFn: async () => {
      // Simulate API delay
      
      // Find segment by ID
      const segment = dummySegments.find(seg => seg.id === segmentId);
      
      if (!segment) {
        throw new Error(`Segment with ID ${segmentId} not found`);
      }
      
      return segment;
    },
    enabled: !!segmentId,
  });
};

export const useGetSegments = (projectId?: string, options?: UseGetSegmentsOptions) => {
  return useQuery({
    queryKey: ["segments", projectId, options],
    queryFn: async () => {
      
      let filteredSegments = [...dummySegments];
      
      // Filter by projectId if provided
      if (projectId) {
        filteredSegments = filteredSegments.filter(
          seg => seg.projectId === projectId
        );
      }
      
      // Filter by status if provided
      if (options?.status) {
        filteredSegments = filteredSegments.filter(
          seg => seg.segmentStatus === options.status
        );
      }
      
      // Calculate project stats if projectId is provided
      let projectStats = null;
      if (projectId) {
        const projectSegments = filteredSegments.filter(
          seg => seg.projectId === projectId
        );
        
        if (projectSegments.length > 0) {
          const totalTasks = projectSegments.reduce(
            (sum, seg) => sum + seg.totalTasks, 0
          );
          const completedTasks = projectSegments.reduce(
            (sum, seg) => sum + seg.completedTasks, 0
          );
          const totalProgress = projectSegments.reduce(
            (sum, seg) => sum + seg.progress, 0
          );
          const avgProgress = projectSegments.length > 0 
            ? Math.round(totalProgress / projectSegments.length) 
            : 0;
          
          const statusCounts = {
            ACTIVE: projectSegments.filter(seg => seg.segmentStatus === "ACTIVE").length,
            ON_HOLD: projectSegments.filter(seg => seg.segmentStatus === "ON_HOLD").length,
            COMPLETED: projectSegments.filter(seg => seg.segmentStatus === "COMPLETED").length,
            OVER_DUE: projectSegments.filter(seg => seg.segmentStatus === "OVER_DUE").length,
          };
          
          projectStats = {
            totalSegments: projectSegments.length,
            totalTasks,
            completedTasks,
            avgProgress,
            statusCounts,
          };
        }
      }
      
      return {
        documents: filteredSegments,
        total: filteredSegments.length,
        projectStats,
      };
    },
    enabled: projectId !== undefined, // Enable if projectId is defined (even if empty string)
  });
};
