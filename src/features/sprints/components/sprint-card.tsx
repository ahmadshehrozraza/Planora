"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, daysSinceStart, daysUntilDue, snakeCaseToTitleCase } from "@/lib/utils";
import { ProgressBar } from "@/components/Progress-bar";
import { SprintStatus } from "../types";
import { DateIndicator, dateFormatter } from "@/components/date-indicator";
import { Layers } from "lucide-react";
import { ColumnCategory } from "@prisma/client";

interface SprintCardProps {
  sprint: any;
  className?: string;
  onClick?: () => void;
}

const SprintCard: React.FC<SprintCardProps> = ({
  sprint,
  className = "",
  onClick
}) => {

  const { statusLabel, remainingText, remainingVariant } = useMemo(() => {
    let text = "";
    let variant = "outline";
    const now = new Date();

    if (sprint.status === SprintStatus.ACTIVE) {
      if (sprint.dueDate && new Date(sprint.dueDate) < now) {
        text = "Overdue";
        variant = "destructive";
      } else {
        text = sprint.dueDate ? `${daysUntilDue(sprint.dueDate)} days left` : "No due date";
        variant = "ACTIVE";
      }
    } else if (sprint.status === SprintStatus.CLOSED) {
      text = "Closed";
      variant = "secondary";
    } else if (sprint.status === SprintStatus.PLANNED) {
      text = sprint.startDate ? `Starts in ${daysUntilDue(sprint.startDate)} days` : "Not started";
      variant = "PLANNED";
    }

    return {
      statusLabel: sprint.status ? snakeCaseToTitleCase(sprint.status) : "Unknown",
      remainingText: text,
      remainingVariant: variant,
    };
  }, [sprint.status, sprint.dueDate, sprint.startDate]);

  const formattedStartDate = useMemo(() => dateFormatter(sprint.startDate || null), [sprint.startDate]);
  const daysSince = useMemo(() => sprint.startDate ? daysSinceStart(sprint.startDate) : "N/A", [sprint.startDate]);

  const tasks = sprint.tasks || [];
  const totalPoints = tasks.reduce((sum: number, t: any) => sum + (t.effortPoints || 0), 0);
  const completedPoints = tasks.filter((t: any) => t.column?.category === ColumnCategory.DONE).reduce((sum: number, t: any) => sum + (t.effortPoints || 0), 0);
  const progress = totalPoints === 0 ? 0 : Math.round((completedPoints / totalPoints) * 100);

  return (
    <Card
      onClick={onClick}
      className={cn("flex flex-col min-h-[200px] justify-between bg-card hover:bg-accent/10 transition-shadow border-border overflow-hidden cursor-pointer rounded-xl", className)}
    >
      <CardHeader className="p-4 bg-muted/20 border-b border-border flex-row items-start justify-between space-y-0 shrink-0">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0 mt-0.5">
             <Layers className="size-4 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="truncate font-bold text-foreground text-sm">{sprint.name}</h2>
            {sprint.goal && <span className="text-xs text-muted-foreground truncate">{sprint.goal}</span>}
          </div>
        </div>
        <Badge variant={sprint.status as any} className="shrink-0 ml-2 shadow-none">
          {statusLabel}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-center gap-3">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Start</span>
            <div className="flex items-center gap-2">
              <span className="text-foreground font-medium">{formattedStartDate}</span>
              {sprint.startDate && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium bg-secondary text-secondary-foreground border-none">{daysSince}</Badge>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">End</span>
            <div className="flex items-center gap-2">
              {sprint.dueDate ? (
                <DateIndicator value={sprint.dueDate} className="text-foreground font-medium text-sm" />
              ) : (
                <span className="text-foreground font-medium">No Date</span>
              )}
              {remainingText && sprint.dueDate && (
                <Badge variant={remainingVariant as any} showIcon={false} className="text-[10px] px-1.5 py-0 font-medium tracking-wide border-none shadow-none">
                  {remainingText}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-dashed border-border mt-auto">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Points Done</span>
            <span className="font-semibold text-foreground bg-secondary/50 px-2 py-0.5 rounded border border-border">
              {completedPoints} / {totalPoints}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-0 shrink-0">
        <ProgressBar value={progress} className="w-full h-1.5 rounded-none" />
      </CardFooter>
    </Card>
  );
};

export default React.memo(SprintCard);