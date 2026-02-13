"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { useGetSegment } from "@/features/segments/api/use-get-segment";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { EditSegmentForm } from "@/features/segments/components/edit-segment-form";
import { useSegmentId } from "@/features/segments/hooks/use-segment-id";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

export const SegmentIdPage = () => {

  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const segmentId = useSegmentId();
  
 const { data: segment, isLoading, error } = useGetSegment(segmentId);

  if (isLoading) {
    return (
        <PageLoader />
    );
  }

  if (error || !segment) {
    return (
        <PageError message="Error loading segments" />
    );
  }

  return (
    <div className="w-full space-y-4">
      <Breadcrumb>
        <BreadcrumbList>

          <BreadcrumbItem>
            <BreadcrumbLink href={`/workspaces/${workspaceId}/projects`}>
              Projects
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink href={`/workspaces/${workspaceId}/projects/${projectId}`}>
              {segment.projectId}
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink href={`/workspaces/${workspaceId}/projects/${projectId}/segments`}>
              Segments
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{segment.name}</BreadcrumbPage>
          </BreadcrumbItem>

        </BreadcrumbList>
      </Breadcrumb>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="flex justify-start gap-2">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="segment">Segment Settings</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          Segment Analytics
        </TabsContent>

        <TabsContent value="tasks" className="border-none">
              <TaskViewSwitcher />
        </TabsContent>

        <TabsContent value="segment">
          <EditSegmentForm initialValues={segment} />
        </TabsContent>

        <TabsContent value="members">
          Segment Members
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default SegmentIdPage;