"use client";

import * as React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, daysSinceStart, daysUntilDue, snakeCaseToTitleCase } from "@/lib/utils";
import { ProgressBar } from "@/components/Progress-bar";
import { LabelValue } from "@/components/label-value";
import { DummySegment, SegmentStatus } from "../types";
import { TaskDate, dateFormatter } from "@/features/tasks/components/task-date";

interface SegmentCardProps {
  segment: DummySegment;
  className?: string;
  view?: "grid" | "list";
}

export const SegmentCard: React.FC<SegmentCardProps> = ({
  segment,
  className = "",
  view = "grid",
}) => {
  return (
    <div className={cn(className)}>
      {view === "grid" ? (
        <Card>
          <CardHeader className="border-none p-2 bg-zinc-100">
            <div className="flex items-center justify-between">
              <h2 className="truncate font-semibold">{segment.name}</h2>
              <Badge variant={segment.segmentStatus}>
                {snakeCaseToTitleCase(segment.segmentStatus)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="border-none p-2 space-y-2">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <LabelValue label="Start Date" labelClassname="min-w-[70px]">
                  <Badge variant="outline">{dateFormatter(segment.startingDate)}</Badge>
                </LabelValue>
                <Badge variant="outline">{daysSinceStart(segment.startingDate)}</Badge>
              </div>

              <div className="flex justify-between flex-wrap-reverse">
                <LabelValue label="End Date" labelClassname="min-w-[70px]">
                  <Badge variant="outline">
                    <TaskDate value={segment.endingDate} />
                  </Badge>
                </LabelValue>

                {segment.segmentStatus === SegmentStatus.ACTIVE && (
                  <Badge variant="ACTIVE" showIcon={false}>
                    {daysUntilDue(segment.endingDate)} days remains
                  </Badge>
                )}
                {segment.segmentStatus === SegmentStatus.OVER_DUE && (
                  <Badge variant="OVER_DUE" showIcon={false}>
                    {daysUntilDue(segment.endingDate)} days overdue
                  </Badge>
                )}
                {segment.segmentStatus === SegmentStatus.COMPLETED && (
                  <Badge variant="COMPLETED" showIcon={false}>
                    {daysUntilDue(segment.endingDate)} days ago
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <LabelValue label="Tasks" labelClassname="min-w-[70px]">
                  <Badge variant="outline">
                    {`${segment.completedTasks} / ${segment.totalTasks}`}
                  </Badge>
                </LabelValue>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center p-3 justify-center">
            <ProgressBar value={segment.progress} className="w-full text-lg" />
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-none p-2">
            <div className="flex justify-between">
              <div className="flex min-w-0">
                <h2 className="ml-2.5 mt-1 truncate font-semibold">{segment.name}</h2>
              </div>

              <div className="flex flex-col space-y-1">
                <div className="flex justify-between">
                  <LabelValue label="Start Date" labelClassname="min-w-[70px]">
                    <Badge variant="outline">{dateFormatter(segment.startingDate)}</Badge>
                  </LabelValue>
                  <Badge variant="outline">{daysSinceStart(segment.startingDate)}</Badge>
                </div>

                <div className="flex justify-between">
                  <LabelValue label="End Date" labelClassname="min-w-[70px]">
                    <Badge variant="outline">
                      <TaskDate value={segment.endingDate} />
                    </Badge>
                  </LabelValue>

                  {segment.segmentStatus === SegmentStatus.ACTIVE && (
                    <Badge variant="ACTIVE">{daysUntilDue(segment.endingDate)} days remaining</Badge>
                  )}
                  {segment.segmentStatus === SegmentStatus.OVER_DUE && (
                    <Badge variant="OVER_DUE">{daysUntilDue(segment.endingDate)} days overdue</Badge>
                  )}
                  {segment.segmentStatus === SegmentStatus.COMPLETED && (
                    <Badge variant="COMPLETED">{daysUntilDue(segment.endingDate)} days ago</Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <div className="flex justify-between">
                  <LabelValue label="Tasks" labelClassname="min-w-[70px]">
                    <Badge variant="outline">
                      {`${segment.completedTasks} / ${segment.totalTasks}`}
                    </Badge>
                  </LabelValue>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Badge variant={segment.segmentStatus}>{segment.segmentStatus}</Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="border-none p-2 space-y-2"></CardContent>

          <CardFooter className="flex items-center p-3 justify-center">
            <ProgressBar value={segment.progress} className="w-full text-lg" />
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default SegmentCard;
