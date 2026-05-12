"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { PageLoader } from "@/components/page-loader";

const ProjectAnalytics = dynamic(
  () => import("@/features/projects/components/project-analytics"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] flex flex-col items-center justify-center space-y-3 bg-card rounded-xl">
         <PageLoader />
      </div>
    )
  }
);

interface AnalyticsClientProps {
  workspaceId: string;
}

export const AnalyticsClient = ({ workspaceId }: AnalyticsClientProps) => {
  const { data, isLoading } = useGetProjects({ workspaceId });
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

  const activeProjectId = selectedProjectId || data?.[0]?.id;

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col gap-6 w-full text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className="w-full sm:w-[300px]">
          <Select value={activeProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full h-10 shadow-sm border-border bg-card">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {data?.map((project) => (
                <SelectItem key={project.id} value={project.id} className="cursor-pointer hover:bg-accent/50 focus:bg-accent/50">
                  <div className="flex items-center gap-2 font-medium">
                    <ProjectAvatar name={project.name} image={project.imageUrl} className="size-6 border border-border" />
                    <span className="truncate">{project.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl shadow-sm border border-border bg-card overflow-hidden">
        {activeProjectId ? (
          <ProjectAnalytics projectId={activeProjectId} />
        ) : (
          <PageLoader />
        )}
      </div>
    </div>
  );
};