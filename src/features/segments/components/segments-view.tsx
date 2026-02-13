"use client";

import { Button } from "@/components/ui/button";
import { useGetDummySegmentsByProject } from "../api/use-get-dummy-segments";
import SegmentCard from "./segmentsCard";

interface SegmentViewProps {
    projectId: string;
}

export function SegmentsView({
    projectId,
}: SegmentViewProps) {
  const { data, isLoading, error } = useGetDummySegmentsByProject(projectId);

  if (isLoading) {
    return <div>Loading segments...</div>;
  }

  if (error) {
    return <div>Error loading segments: {error.message}</div>;
  }

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <div className="p-4">
          {data?.documents && data.documents.length > 0 ? (
            <div className="space-y-4">
              {/* Total segments count */}
              <div className="text-sm text-gray-500 mb-2">
                Total {data.total} segments found
              </div>
              
              {/* Segments grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.documents.map((segment) => (
                  <SegmentCard 
                    key={segment.id}
                    segment={segment}
                    onClick={() => console.log('Clicked:', segment.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No segments found for this project
            </div>
          )}
        </div>
      </div>
    </div>
  );
}