"use client";

import * as React from "react";
import { useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, daysSinceStart, daysUntilDue, snakeCaseToTitleCase } from "@/lib/utils";
import { ProgressBar } from "@/components/Progress-bar";
import { DummySegment, SegmentStatus } from "../types";
import { DateIndicator, dateFormatter } from "@/components/date-indicator";
import { Layers } from "lucide-react"; 

interface SegmentCardProps {
  segment: DummySegment;
  className?: string;
  view?: "grid" | "list";
}

const SegmentCardComponent: React.FC<SegmentCardProps> = ({
  segment,
  className = "",
  view = "grid",
}) => {

  const { statusLabel, remainingText, remainingVariant } = useMemo(() => {
    const daysRemaining = daysUntilDue(segment.endingDate);
    let text = "";
    let variant = "outline";

    if (segment.segmentStatus === SegmentStatus.ACTIVE) {
        text = `${daysRemaining} days remaining`;
        variant = "ACTIVE";
    } else if (segment.segmentStatus === SegmentStatus.OVER_DUE) {
        text = `${daysRemaining} days overdue`;
        variant = "OVER_DUE";
    } else if (segment.segmentStatus === SegmentStatus.COMPLETED) {
        text = `${daysRemaining} days ago`; 
        variant = "COMPLETED";
    }

    return {
        statusLabel: snakeCaseToTitleCase(segment.segmentStatus),
        remainingText: text,
        remainingVariant: variant,
    };
  }, [segment.segmentStatus, segment.endingDate]);

  const formattedStartDate = useMemo(() => dateFormatter(segment.startingDate), [segment.startingDate]);
  const daysSince = useMemo(() => daysSinceStart(segment.startingDate), [segment.startingDate]);

  if (view === "list") {
      return (
          <Card className={cn("flex flex-col sm:flex-row items-center justify-between p-4 gap-4 bg-card hover:bg-accent/50 transition-colors border-border shadow-sm hover:shadow-md", className)}>
              <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
                  <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Layers className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                      <h2 className="truncate font-bold text-foreground">{segment.name}</h2>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 truncate font-medium">
                          <span>{formattedStartDate}</span>
                          <span>—</span>
                          <DateIndicator value={segment.endingDate} />
                      </div>
                  </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto shrink-0">
                  <div className="flex flex-col gap-1 text-xs">
                      <span className="text-muted-foreground font-medium">
                          Tasks: <span className="font-bold text-foreground">{segment.completedTasks || 0} / {segment.totalTasks}</span>
                      </span>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge variant={segment.segmentStatus as any}>{statusLabel}</Badge>
                      {remainingText && (
                          <span className={cn("text-[10px] font-bold uppercase tracking-wider", segment.segmentStatus === 'OVER_DUE' ? 'text-destructive' : 'text-muted-foreground')}>
                              {remainingText}
                          </span>
                      )}
                  </div>

                  <div className="w-24 shrink-0 hidden md:block">
                      <ProgressBar value={segment.progress} className="h-2" />
                  </div>
              </div>
          </Card>
      );
  }

  return (
    <Card className={cn("flex flex-col min-h-[190px] justify-between bg-card hover:bg-accent/10 transition-shadow border-border overflow-hidden", className)}>
      <CardHeader className="p-4 bg-muted/30 border-b border-border flex-row items-center justify-between space-y-0 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="size-4 text-primary shrink-0" />
          <h2 className="truncate font-bold text-foreground text-[15px]">{segment.name}</h2>
        </div>
        <Badge variant={segment.segmentStatus as any} className="shrink-0 ml-2">
          {statusLabel}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-center gap-4">
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">Start Date</span>
            <div className="flex items-center gap-2">
               <span className="text-foreground font-semibold">{formattedStartDate}</span>
               <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-bold bg-secondary text-secondary-foreground border-none">{daysSince}</Badge>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">End Date</span>
            <div className="flex items-center gap-2">
               <DateIndicator value={segment.endingDate} className="text-foreground font-semibold" />
               {remainingText && (
                 <Badge variant={remainingVariant as any} showIcon={false} className="text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider border-none">
                   {remainingText}
                 </Badge>
               )}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-dashed border-border mt-auto">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">Task Progress</span>
            <span className="font-bold text-foreground bg-secondary px-2 py-0.5 rounded-md">
                {segment.completedTasks || 0} / {segment.totalTasks}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 pb-10 shrink-0">
        <ProgressBar value={segment.progress} className="w-full h-1.5" />
      </CardFooter>
    </Card>
  );
};

export default React.memo(SegmentCardComponent);