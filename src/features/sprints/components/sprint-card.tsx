"use client";

import * as React from "react";
import { useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, daysSinceStart, daysUntilDue, snakeCaseToTitleCase } from "@/lib/utils";
import { ProgressBar } from "@/components/Progress-bar";
import { SprintStatus } from "../types";
import { DateIndicator, dateFormatter } from "@/components/date-indicator";
import { Layers } from "lucide-react";

interface SprintCardProps {
  sprint: any;
  className?: string;
  view?: "grid" | "list";
  onClick?: () => void;
}

const SprintCard: React.FC<SprintCardProps> = ({
  sprint,
  className = "",
  view = "grid",
  onClick
}) => {

  const { statusLabel, remainingText, remainingVariant } = useMemo(() => {
    const daysRemaining = sprint.dueDate ? daysUntilDue(sprint.dueDate) : 0;
    let text = "";
    let variant = "outline";

    if (sprint.status === SprintStatus.ACTIVE) {
      text = sprint.dueDate ? `${daysRemaining} days remaining` : "No due date";
      variant = "ACTIVE";
    } else if (sprint.status === SprintStatus.OVER_DUE) {
      text = `${daysRemaining} days overdue`;
      variant = "OVER_DUE";
    } else if (sprint.status === SprintStatus.COMPLETED) {
      text = `${daysRemaining} days ago`;
      variant = "COMPLETED";
    }

    return {
      statusLabel: sprint.status ? snakeCaseToTitleCase(sprint.status) : "Unknown",
      remainingText: text,
      remainingVariant: variant,
    };
  }, [sprint.status, sprint.dueDate]);

  const formattedStartDate = useMemo(() => dateFormatter(sprint.startDate || null), [sprint.startDate]);
  const daysSince = useMemo(() => sprint.startDate ? daysSinceStart(sprint.startDate) : "N/A", [sprint.startDate]);

  const tasks = sprint.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.progress === 100).length;

  const progress = useMemo(() => {
    if (totalTasks === 0) return 0;
    const totalProgressSum = tasks.reduce((sum: number, t: any) => sum + (t.progress || 0), 0);
    return Math.round(totalProgressSum / totalTasks);
  }, [tasks, totalTasks]);

  if (view === "list") {
    return (
      <Card
        onClick={onClick}
        className={cn("flex flex-col sm:flex-row items-center justify-between p-4 gap-4 bg-card hover:bg-accent/50 transition-colors border-border shadow-sm hover:shadow-md cursor-pointer", className)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
          <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Layers className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-bold text-foreground">{sprint.name}</h2>
            {sprint.goal && <p className="truncate text-xs text-muted-foreground">{sprint.goal}</p>}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 truncate font-medium">
              <span>{formattedStartDate}</span>
              {sprint.dueDate && (
                <>
                  <span>—</span>
                  <DateIndicator value={sprint.dueDate} />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto shrink-0">
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground font-medium">
              Tasks: <span className="font-bold text-foreground">{completedTasks} / {totalTasks}</span>
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge variant={sprint.status as any}>{statusLabel}</Badge>
            {remainingText && (
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", sprint.status === 'OVER_DUE' ? 'text-destructive' : 'text-muted-foreground')}>
                {remainingText}
              </span>
            )}
          </div>

          <div className="w-24 shrink-0 hidden md:block">
            <ProgressBar value={progress} className="h-2" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      className={cn("flex flex-col min-h-[190px] justify-between bg-card hover:bg-accent/10 transition-shadow border-border overflow-hidden cursor-pointer", className)}
    >
      <CardHeader className="p-4 bg-muted/30 border-b border-border flex-row items-center justify-between space-y-0 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="size-4 text-primary shrink-0" />
          <div className="flex flex-col">
            <h2 className="truncate font-bold text-foreground text-[15px]">{sprint.name}</h2>
            {sprint.goal && <span className="text-[10px] text-muted-foreground truncate">{sprint.goal}</span>}
          </div>
        </div>
        <Badge variant={sprint.status as any} className="shrink-0 ml-2">
          {statusLabel}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-center gap-4">
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">Start Date</span>
            <div className="flex items-center gap-2">
              <span className="text-foreground font-semibold">{formattedStartDate}</span>
              {sprint.startDate && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-bold bg-secondary text-secondary-foreground border-none">{daysSince}</Badge>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">End Date</span>
            <div className="flex items-center gap-2">
              {sprint.dueDate ? (
                <DateIndicator value={sprint.dueDate} className="text-foreground font-semibold" />
              ) : (
                <span className="text-foreground font-semibold">No Date</span>
              )}
              {remainingText && sprint.dueDate && (
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
              {completedTasks} / {totalTasks}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 pb-10 shrink-0">
        <ProgressBar value={progress} className="w-full h-1.5" />
      </CardFooter>
    </Card>
  );
};

export default React.memo(SprintCard);