
import { Navbar } from "@/components/navbar";
import { AnalyticsClient } from "./client";

export default async function AnalyticsPage({
  params,
}: { params: { workspaceId: string };
}) {

  
  return (
    <div className="flex flex-col">
        <Navbar title="Analytics" description="View you projects' analytics here" />
        <AnalyticsClient workspaceId={params.workspaceId} />
    </div>
  );
}