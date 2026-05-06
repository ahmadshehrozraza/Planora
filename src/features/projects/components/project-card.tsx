"use client";

import * as React from "react";
import { useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, daysSinceStart, daysUntilDue, snakeCaseToTitleCase } from "@/lib/utils";
import { ProgressBar } from "@/components/Progress-bar";
import { Project, ProjectStatus } from "@/features/projects/types";
import { ProjectAvatar } from "./project-avatar";
import { dateFormatter, DateIndicator } from "@/components/date-indicator";
import { Github } from "lucide-react";

interface ProjectCardProps {
  project: Project & { stats?: any; githubRepoUrl?: string | null };
  className?: string;
  view?: "grid" | "list";
}

const ProjectCardComponent: React.FC<ProjectCardProps> = ({
  project,
  className = "",
  view = "grid",
}) => {

  const { statusLabel, remainingText, remainingVariant } = useMemo(() => {
    const daysRemaining = project.dueDate ? daysUntilDue(project.dueDate) : 0;
    let text = "";
    let variant = "outline";

    if (project.status === ProjectStatus.ACTIVE) {
        text = project.dueDate ? `${daysRemaining} days remaining` : "No due date";
        variant = "ACTIVE";
    } else if (project.status === ProjectStatus.OVER_DUE) {
        text = `${daysRemaining} days overdue`;
        variant = "OVER_DUE";
    } else if (project.status === ProjectStatus.COMPLETED) {
        text = `${daysRemaining} days ago`; 
        variant = "COMPLETED";
    }

    return {
        statusLabel: project.status ? snakeCaseToTitleCase(project.status) : "Unknown",
        remainingText: text,
        remainingVariant: variant,
    };
  }, [project.status, project.dueDate]);

  const formattedStartDate = useMemo(() => dateFormatter(project.startDate || null), [project.startDate]);
  const daysSince = useMemo(() => project.startDate ? daysSinceStart(project.startDate) : "N/A", [project.startDate]);

  const stats = project.stats || {
      progress: 0,
      completedTasks: 0,
      totalTasks: 0,
      completedSprints: 0,
      totalSprints: 0
  };

  const { progress, completedTasks, totalTasks, completedSprints, totalSprints } = stats;

  if (view === "list") {
      return (
          <Card className={cn("flex flex-col sm:flex-row items-center justify-between p-4 gap-4 bg-card hover:bg-accent/50 transition-colors border-border shadow-sm hover:shadow-md", className)}>
              
              <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
                  <ProjectAvatar 
                    name={project.name} 
                    className="size-10 shrink-0 shadow-sm"
                    image={project.imageUrl}
                    />
                  <div className="min-w-0 flex items-center gap-2">
                      <h2 className="truncate font-semibold text-foreground">{project.name}</h2>
                      {project.githubRepoUrl && (
                          <a 
                            href={project.githubRepoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                              <Github className="size-4" />
                          </a>
                      )}
                  </div>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 truncate">
                      <span>{formattedStartDate}</span>
                      {project.dueDate && (
                          <>
                            <span>—</span>
                            <DateIndicator value={project.dueDate} />
                          </>
                      )}
                  </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto shrink-0">
                  <div className="flex flex-col gap-1 text-xs">
                      <span className="text-muted-foreground">
                          Tasks: <span className="font-semibold text-foreground">{completedTasks} / {totalTasks}</span>
                      </span>
                      <span className="text-muted-foreground">
                          Sprints: <span className="font-semibold text-foreground">{completedSprints} / {totalSprints}</span>
                      </span>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge variant={project.status as any}>{statusLabel}</Badge>
                      {remainingText && (
                          <span className={cn("text-[10px] font-medium", project.status === 'OVER_DUE' ? 'text-destructive' : 'text-muted-foreground')}>
                              {remainingText}
                          </span>
                      )}
                  </div>

                  <div className="w-24 shrink-0 hidden md:block">
                      <ProgressBar value={progress} className="h-1.5" />
                  </div>
              </div>
          </Card>
      );
  }

  return (
    <Card className={cn("flex flex-col justify-between bg-card hover:bg-accent/10 transition-colors border-border overflow-hidden", className)}>

      <CardHeader className="p-4 bg-muted/30 border-b border-border flex-row items-start justify-between space-y-0 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <ProjectAvatar 
            name={project.name} 
            className="size-8 shadow-sm"
            image={project.imageUrl}
            />
          <h2 className="truncate font-semibold text-foreground text-sm">{project.name}</h2>
          {project.githubRepoUrl && (
              <a 
                href={project.githubRepoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-foreground transition-colors ml-1"
              >
                  <Github className="size-4" />
              </a>
          )}
        </div>
        <Badge variant={project.status as any} className="shrink-0 ml-2">
          {statusLabel}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-center gap-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">Start Date</span>
            <div className="flex items-center gap-2">
               <span className="text-foreground font-medium">{formattedStartDate}</span>
               {project.startDate && (
                   <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-normal bg-secondary text-secondary-foreground border-none">{daysSince}</Badge>
               )}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">End Date</span>
            <div className="flex items-center gap-2">
               {project.dueDate ? (
                   <DateIndicator value={project.dueDate} className="text-foreground font-medium" />
               ) : (
                   <span className="text-foreground font-medium">No Date</span>
               )}
               
               {remainingText && project.dueDate && (
                 <Badge variant={remainingVariant as any} className="text-[9px] px-1.5 py-0 font-normal border-none">
                   {remainingText}
                 </Badge>
               )}
            </div>
          </div>
        </div>

        <div className="space-y-2.5 border-t border-dashed border-border mt-auto pt-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">Tasks</span>
            <span className="font-semibold text-foreground">{completedTasks} / {totalTasks}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">Sprints</span>
            <span className="font-semibold text-foreground">{completedSprints} / {totalSprints}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className=" shrink-0 p-4 pt-0 pb-10">
        <ProgressBar value={progress} className="w-full h-1.5" />
      </CardFooter>
    </Card>
  );
};

export const ProjectCard = React.memo(ProjectCardComponent);