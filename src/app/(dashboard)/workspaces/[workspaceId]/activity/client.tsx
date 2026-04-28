"use client";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaceLogs } from "@/features/activity-logs/api/use-get-workspace-logs";
import { ActivityTimeline } from "@/features/activity-logs/components/activity-timeline";
import { PageLoader } from "@/components/page-loader";

export default function WorkspaceActivityClient() {
    const workspaceId = useWorkspaceId();
    const { data: logs, isLoading } = useGetWorkspaceLogs(workspaceId as string);

    if (isLoading) return <PageLoader />;

    return (
        <div className="p-6 space-y-6">
            <ActivityTimeline logs={logs || []} />
        </div>
    );
}