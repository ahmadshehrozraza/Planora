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
        <div className="bg-card text-card-foreground p-2.5 mb-2 rounded-lg shadow-sm border border-border space-y-2.5 hover:border-primary/40 transition-colors">
            
            <div className="flex items-start justify-between gap-x-2">
                <p className="text-sm font-medium line-clamp-2 leading-tight">{task.name}</p>
                <TaskActions 
    id={task.id} 
    projectId={task.projectId}
    assigneeId={task.assigneeId || task.assignee?.id} 
    assigneeEmail={task.assignee?.email} 
>
    <MoreHorizontal className="size-[18px] stroke-1 shrink-0 text-muted-foreground hover:text-foreground hover:opacity-75 transition cursor-pointer" />
</TaskActions>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4.5 font-medium bg-white dark:bg-transparent">
                    {snakeCaseToTitleCase(task.taskType)}
                </Badge>
                <Badge variant={task.priority as any} className="text-[10px] px-1.5 py-0 h-4.5 font-medium">
                    {snakeCaseToTitleCase(task.priority)}
                </Badge>
            </div>
            
            <Separator className="bg-border" />
            
            <div className="flex items-center gap-x-1.5">
                <MemberAvatar 
                    name={assigneeName}
                    src={task.assignee?.image}
                    fallbackClassname="text-[10px]"
                    className="size-5 shrink-0" 
                />
                <div className="size-1 rounded-full bg-border shrink-0" />
                <DateIndicator value={task.dueDate} className="text-xs text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-x-1.5">
                <ProjectAvatar
                    name={projectName}
                    image={projectImage}
                    className="size-5 shrink-0"
                    fallbackClassName="text-[10px]"
                />
                <span className="text-xs text-muted-foreground font-medium truncate">
                    {projectName}
                </span>
            </div>
        </div>
    );
};