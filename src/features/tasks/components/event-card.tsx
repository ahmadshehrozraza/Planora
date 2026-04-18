"use client";

import { cn } from "@/lib/utils";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";

interface EventCardProps {
    id: string;
    title: string;
    assignee: any;
    project: any;
    status?: any;
}

export const EventCard = ({
    id,
    title,
    assignee,
    project,
    status,
}: EventCardProps) => {

    const workspaceId = useWorkspaceId();
    const router = useRouter();

    const onClick = (
        e: React.MouseEvent<HTMLDivElement> 
    ) => {
        e.stopPropagation();
        router.push(`/workspaces/${workspaceId}/tasks/${id}`);
    }

    const assigneeName = typeof assignee === "string" ? assignee : (assignee?.name || "Unassigned");
    const assigneeImage = typeof assignee === "string" ? undefined : (assignee?.image || assignee?.avatarUrl);
    
    const projectName = typeof project === "string" ? project : (project?.name || "Unknown Project");
    const projectImage = typeof project === "string" ? undefined : project?.imageUrl;

    return (
        <div className="max-w-full h-full overflow-hidden">
            <div onClick={onClick} className={cn(
                "p-1.5 w-full h-full text-xs bg-card text-card-foreground border border-border rounded-md border-l-[4px] border-l-primary flex flex-col gap-y-1.5 cursor-pointer hover:bg-muted/50 transition-colors shadow-sm",
            )}>
                <p className="font-semibold truncate w-full" title={title}>
                    {title}
                </p>
                
                <div className="flex items-center gap-x-1.5 min-w-0 mt-auto">
                    <MemberAvatar
                        name={assigneeName}
                        src={assigneeImage}
                        className="size-4 shrink-0"
                        fallbackClassname="text-[8px]" 
                    />
                    
                    <div className="size-1 rounded-full bg-border shrink-0" />

                    <ProjectAvatar
                        name={projectName}
                        image={projectImage}
                        className="size-4 shrink-0"
                        fallbackClassName="text-[8px]"
                    />
                </div>
            </div>
        </div>
    )
}