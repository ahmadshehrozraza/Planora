"use client";

import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity } from "lucide-react";

interface ActivityTimelineProps {
  logs: any[];
  isLoading?: boolean;
}

export const ActivityTimeline = ({ logs, isLoading }: ActivityTimelineProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-4 p-4 items-center justify-center text-muted-foreground">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
        <p className="text-sm">Loading activity...</p>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed">
        <Activity className="h-8 w-8 text-muted-foreground/50 mb-3" />
        <p className="text-sm font-medium text-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Actions taken here will appear in this timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="relative space-y-4">
        {logs.map((log, index) => {
          const isLast = index === logs.length - 1;

          return (
            <li key={log.id} className="relative flex gap-x-4">
              <div
                className={`absolute left-0 top-0 flex w-10 justify-center ${
                  isLast ? "h-6" : "-bottom-4"
                }`}
              >
                <div className="w-px bg-border" />
              </div>

              <div className="relative flex h-10 w-10 flex-none items-center justify-center bg-background">
                <Avatar className="h-8 w-8 border bg-muted">
                  <AvatarImage src={log.user?.image || ""} />
                  <AvatarFallback className="text-xs font-medium">
                    {log.user?.name ? log.user.name.charAt(0).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-auto pt-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-1 gap-x-4">
                  
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground mr-1.5">
                      {log.user?.name || "Unknown User"}
                    </span>
                    <span>{log.metadata?.message?.toLowerCase() || "performed an action"}</span>
                  </div>

                  <time className="flex-none text-[11px] text-muted-foreground font-medium">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </time>

                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};