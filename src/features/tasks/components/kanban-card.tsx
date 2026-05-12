"use client";

import { MoreHorizontal } from "lucide-react";
import { TaskActions } from "./task-actions";
import { Separator } from "@/components/ui/separator";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { DateIndicator } from "@/components/date-indicator";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Badge } from "@/components/ui/badge";
import { snakeCaseToTitleCase } from "@/lib/utils";

interface KanbanCardProps {
    task: any; 
}

export const KanbanCard = ({
    task,
}: KanbanCardProps) => {

    const assigneeName = task.assignee?.name || "Unassigned";
    const projectName = task.project?.name || "Unknown Project";
    const projectImage = task.project?.imageUrl;

    return (
        <div className="bg-card text-card-foreground p-3 mb-2.5 rounded-lg shadow-sm border border-border flex flex-col gap-3 hover:border-primary/40 hover:shadow-md transition-all group">
            
            <div className="flex items-start justify-between gap-x-2">
                <p className="text-sm font-medium line-clamp-2 leading-snug">{task.name}</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <TaskActions 
                      id={task.id} 
                      projectId={task.projectId}
                      assigneeId={task.assigneeId || task.assignee?.id} 
                      assigneeEmail={task.assignee?.email} 
                  >
                      <MoreHorizontal className="size-4 shrink-0 text-muted-foreground hover:text-foreground transition cursor-pointer" />
                  </TaskActions>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4.5 font-medium bg-secondary/50 text-secondary-foreground border-none">
                    {snakeCaseToTitleCase(task.taskType)}
                </Badge>
                <Badge variant={task.priority as any} className="text-[10px] px-1.5 py-0 h-4.5 font-medium shadow-none">
                    {snakeCaseToTitleCase(task.priority)}
                </Badge>
            </div>
            
            <Separator className="bg-border/50" />
            
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-x-2">
                    <MemberAvatar 
                        name={assigneeName}
                        src={task.assignee?.image}
                        fallbackClassname="text-[9px]"
                        className="size-5 shrink-0 border border-background" 
                    />
                    <DateIndicator value={task.dueDate} className="text-[11px] text-muted-foreground font-medium" />
                </div>
                
                <div className="flex items-center gap-x-1.5 max-w-[40%]">
                    <span className="text-[10px] text-muted-foreground font-medium truncate">
                        {projectName}
                    </span>
                    <ProjectAvatar
                        name={projectName}
                        image={projectImage}
                        className="size-4 shrink-0 border border-border"
                        fallbackClassName="text-[8px]"
                    />
                </div>
            </div>
        </div>
    );
};