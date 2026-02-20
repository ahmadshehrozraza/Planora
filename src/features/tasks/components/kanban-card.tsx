import { MoreHorizontal } from "lucide-react";
import { Task } from "../types";
import { TaskActions } from "./task-actions";
import { Separator } from "@/components/ui/separator";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { DateIndicator } from "@/components/date-indicator";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

interface KanbanCardProps {
    task: Task;
}

export const KanbanCard = ({
    task,
}: KanbanCardProps) => {
    return (
        <div className="bg-card text-card-foreground p-2.5 mb-2 rounded-lg shadow-sm border border-border space-y-2.5 hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between gap-x-2">
                <p className="text-sm font-medium line-clamp-1">{task.name}</p>
                <TaskActions id={task.id || task.id} projectId={task.projectId}>
                    <MoreHorizontal className="size-[18px] stroke-1 shrink-0 text-muted-foreground hover:text-foreground hover:opacity-75 transition cursor-pointer" />
                </TaskActions>
            </div>
            
            <Separator className="bg-border" />
            
            <div className="flex items-center gap-x-1.5">
                <MemberAvatar 
                    name={task.assigneeId || "Unassigned"}
                    fallbackClassname="text-[10px]"
                    className="size-5 shrink-0" 
                />
                <div className="size-1 rounded-full bg-border shrink-0" />
                <DateIndicator value={task.endDate || task.endDate} className="text-xs text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-x-1.5">
                <ProjectAvatar
                    name={task.projectId || "Project"}
                    className="size-5 shrink-0"
                    fallbackClassName="text-[10px]"
                />
                <span className="text-xs text-muted-foreground font-medium truncate">
                    {task.projectId || "Project"}
                </span>
            </div>
        </div>
    );
};