"use client";

import { useGetSprints } from "../api/use-get-sprints";
import SprintCard from "./sprint-card";

interface SprintViewProps {
  projectId: string;
}

export function SprintsView({
  projectId,
}: SprintViewProps) {
  const { data, isLoading, error } = useGetSprints(projectId);

  if (isLoading) {
    return <div>Loading sprints...</div>;
  }

  if (error) {
    return <div>Error loading sprints: {error.message}</div>;
  }

  const sprints = data || [];

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <div className="p-4">
          {sprints.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-500 mb-2">
                Total {sprints.length} sprints found
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sprints.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    onClick={() => console.log('Clicked:', sprint.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No sprints found for this project
            </div>
          )}
        </div>
      </div>
    </div>
  );
}