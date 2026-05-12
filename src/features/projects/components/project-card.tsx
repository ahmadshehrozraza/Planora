"use client";

import * as React from "react";
import { useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, daysSinceStart, daysUntilDue, snakeCaseToTitleCase } from "@/lib/utils";
import { ProgressBar } from "@/components/Progress-bar";
import { ProjectAvatar } from "./project-avatar";
import { dateFormatter, DateIndicator } from "@/components/date-indicator";
import { Github, FolderGit2 } from "lucide-react";
import { ProjectStatus } from "@prisma/client";

interface ProjectCardProps {
  project: any;
  className?: string;
  view?: "grid" | "list";
}

const ProjectCardComponent: React.FC<ProjectCardProps> = ({
  project,
  className = "",
  view = "grid",
}) => {

  const { statusLabel, remainingText, remainingVariant } = useMemo(() => {
    let text = "";
    let variant = "outline";
    const now = new Date();

    if (project.status === ProjectStatus.ACTIVE) {
        if (project.dueDate && new Date(project.dueDate) < now) {
            text = "Overdue";
            variant = "destructive";
        } else {
            text = project.dueDate ? `${daysUntilDue(project.dueDate)} days left` : "No due date";
            variant = "ACTIVE";
        }
    } else if (project.status === ProjectStatus.COMPLETED) {
        text = "Completed";
        variant = "secondary";
    } else if (project.status === ProjectStatus.CANCELLED) {
        text = "Cancelled";
        variant = "destructive";
    } else if (project.status === ProjectStatus.ON_HOLD) {
        text = "Paused";
        variant = "warning";
    } else if (project.status === ProjectStatus.PLANNED) {
        text = project.startDate ? `Starts in ${daysUntilDue(project.startDate)} days` : "Not started";
        variant = "PLANNED";
    }

    return {
        statusLabel: project.status ? snakeCaseToTitleCase(project.status) : "Unknown",
        remainingText: text,
        remainingVariant: variant,
    };
  }, [project.status, project.dueDate, project.startDate]);

  const formattedStartDate = useMemo(() => dateFormatter(project.startDate || null), [project.startDate]);

  const stats = project.stats || {
      progress: 0,
      completedTasks: 0,
      totalTasks: 0,
      completedSprints: 0,
      totalSprints: 0
  };

  const { progress, completedTasks, totalTasks, completedSprints, totalSprints } = stats;

  const isInactive = project.status === ProjectStatus.COMPLETED || project.status === ProjectStatus.CANCELLED || project.status === ProjectStatus.ON_HOLD;

  if (view === "list") {
      return (
          <Card className={cn("flex flex-col sm:flex-row items-center justify-between p-4 gap-4 bg-card hover:bg-accent/40 transition-colors border-border shadow-sm rounded-xl group", className, isInactive && "opacity-80 grayscale-[20%]")}>
              
              <div className="flex items-center gap-4 min-w-0 flex-1 w-full sm:w-auto">
                  <ProjectAvatar 
                    name={project.name} 
                    className="size-10 shrink-0 border border-border/50"
                    image={project.imageUrl}
                    />
                  <div className="min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                          <h2 className="truncate font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{project.name}</h2>
                          {project.githubRepoUrl && (
                              <a 
                                href={project.githubRepoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                  <Github className="size-3.5" />
                              </a>
                          )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>{formattedStartDate}</span>
                          {project.dueDate && (
                              <>
                                <span className="opacity-50">—</span>
                                <DateIndicator value={project.dueDate} />
                              </>
                          )}
                      </div>
                  </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0">
                  <div className="flex flex-col gap-1 text-xs">
                      <span className="text-muted-foreground">
                          Tasks <span className="font-semibold text-foreground ml-1">{completedTasks}/{totalTasks}</span>
                      </span>
                      <span className="text-muted-foreground">
                          Sprints <span className="font-semibold text-foreground ml-1">{completedSprints}/{totalSprints}</span>
                      </span>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge variant={project.status} className="shadow-none tracking-wide">{statusLabel}</Badge>
                      {remainingText && (
                          <span className={cn("text-[10px] font-medium", remainingVariant === 'destructive' ? 'text-destructive font-bold' : 'text-muted-foreground')}>
                              {remainingText}
                          </span>
                      )}
                  </div>

                  <div className="w-24 shrink-0 hidden md:block">
                      <ProgressBar value={progress} className={cn("h-1.5", isInactive && "grayscale")} />
                  </div>
              </div>
          </Card>
      );
  }

  return (
    <Card className={cn("flex flex-col min-h-[200px] justify-between bg-card hover:bg-accent/40 transition-colors border-border overflow-hidden rounded-xl shadow-sm group cursor-pointer", className, isInactive && "opacity-80 grayscale-[20%]")}>

      <CardHeader className="p-4 bg-muted/20 border-b border-border flex-row items-start justify-between space-y-0 shrink-0">
        <div className="flex items-start gap-3 min-w-0">
             <ProjectAvatar 
                name={project.name} 
                className="size-10 shrink-0"
                image={project.imageUrl}
             />
          <div className="flex flex-col min-w-0">
             <div className="flex items-center gap-1.5">
                <h2 className="truncate font-bold text-foreground text-sm group-hover:text-primary transition-colors">{project.name}</h2>
                {project.githubRepoUrl && (
                    <a 
                      href={project.githubRepoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Github className="size-3.5" />
                    </a>
                )}
             </div>
             {project.description && <span className="text-xs text-muted-foreground truncate">{project.description}</span>}
          </div>
        </div>
        <Badge variant={project.status} className="shrink-0 ml-2 shadow-none uppercase tracking-wide text-[10px]">
          {statusLabel}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-center gap-3">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Start Date</span>
            <span className="text-foreground font-medium">{formattedStartDate}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">End Date</span>
            <div className="flex items-center gap-2">
               {project.dueDate ? (
                   <DateIndicator value={project.dueDate} className="text-foreground font-medium text-sm" />
               ) : (
                   <span className="text-foreground font-medium text-xs">No Date</span>
               )}
               {remainingText && project.dueDate && (
                 <Badge variant={remainingVariant as any} showIcon={false} className="text-[10px] px-1.5 py-0 font-medium border-none shadow-none uppercase tracking-wider">
                   {remainingText}
                 </Badge>
               )}
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-dashed border-border mt-auto pt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Tasks Progress</span>
            <span className="font-semibold text-foreground bg-secondary/50 px-2 py-0.5 rounded border border-border">
                {completedTasks} / {totalTasks}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="shrink-0 p-0">
        <ProgressBar value={progress} className={cn("w-full h-1.5 rounded-none", isInactive && "grayscale")} />
      </CardFooter>
    </Card>
  );
};

export const ProjectCard = React.memo(ProjectCardComponent);