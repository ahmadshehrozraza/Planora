import { Navbar } from "@/components/navbar";
import { SegmentIdClient } from "./client";

export default async function SegmentIdPage({
  params,
}: {
  params: { workspaceId: string; projectId: string; segmentId: string };
}) {
  return (
    <div className="flex flex-col w-full">
        <Navbar title="Segment Details" description="View & manage your segment details here" />
        <SegmentIdClient 
          workspaceId={params.workspaceId} 
          projectId={params.projectId} 
          segmentId={params.segmentId} 
        />
    </div>
  );
}