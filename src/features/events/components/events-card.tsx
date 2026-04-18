"use client";

import { cn } from "@/lib/utils";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { DateIndicator } from "@/components/date-indicator";
import { differenceInDays } from "date-fns";
import { EventTypes } from "../types";

interface EventsCardProps extends Partial<EventTypes> {
    id: string;
    title: string;
    date: string;
    variant?: "default" | "mini";
}

export const EventsCard = ({
    id,
    title,
    date,
    time,
    project,
    segment,
    description,
    eventCreator,
    opened = true,
    variant = "default",
}: EventsCardProps) => {

    const workspaceId = useWorkspaceId();
    const router = useRouter();

    const isNew = !opened;
    const isMini = variant === "mini";

    const eventDate = new Date(date);
    const today = new Date();
    const diffInDays = differenceInDays(eventDate, today);

    let borderColorClass = "border-l-emerald-500"; 

    if (diffInDays < 0) {
        borderColorClass = "border-l-rose-600 dark:border-l-rose-500";
    } else if (diffInDays <= 3) {
        borderColorClass = "border-l-orange-500 dark:border-l-orange-400"; 
    } else if (diffInDays <= 14) {
        borderColorClass = "border-l-amber-500 dark:border-l-amber-400"; 
    }

    const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        router.push(`/workspaces/${workspaceId}/events/${id}`);
    };

    return (
        <div className="px-1 w-full overflow-hidden">
            <div
                onClick={onClick}
                className={cn(
                    "bg-card text-card-foreground border-border border rounded-md shadow-sm flex flex-col cursor-pointer transition-all group overflow-hidden relative",
                    isMini
                        ? "p-2 gap-y-1.5 text-[10px] hover:bg-accent/50"
                        : "p-3 gap-y-2 text-xs hover:shadow-md hover:bg-accent/10",
                    "border-l-[3px]", 
                    borderColorClass
                )}
            >
                <div className="flex items-start justify-between gap-1">
                    <p className={cn(
                        "font-semibold truncate w-full leading-tight",
                        isNew ? "text-foreground font-bold" : "text-muted-foreground",
                        isMini ? "text-[11px]" : "text-sm"
                    )} title={title}>
                        {title}
                    </p>
                    {isNew && (
                        <div className={cn(
                            "rounded-full shrink-0 bg-primary animate-pulse",
                            isMini ? "size-1.5 mt-1" : "size-2 mt-1"
                        )} title="New Event" />
                    )}
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground w-full overflow-hidden">
                    
                    {time && (
                        <div className="flex items-center gap-0.5 shrink-0 bg-muted/50 px-1 py-0.5 rounded-sm border border-border">
                            <Clock className={cn("shrink-0 text-muted-foreground", isMini ? "size-2.5" : "size-3")} />
                            <span className={cn("font-medium text-foreground", isMini ? "text-[9px]" : "")}>{time}</span>
                        </div>
                    )}

                    {segment && (
                        <div className="flex items-center gap-0.5 min-w-0">
                             {!isMini && <span className="text-muted-foreground/50">•</span>}
                             <span className="truncate text-[9px] text-muted-foreground opacity-80 max-w-[60px]" title={segment.name}>
                                {segment.name}
                             </span>
                        </div>
                    )}
                </div>

                {!isMini && description && (
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                        {description}
                    </p>
                )}

                <div className={cn(
                    "flex items-center justify-between pt-1 mt-0.5",
                    !isMini && "border-t border-dashed border-border mt-2"
                )}>
                    <div className="flex items-center -space-x-1.5 pl-0.5">
                        {project && (
                            <div title={project.name} className="relative z-10">
                                <ProjectAvatar
                                    name={project.name}
                                    image={project.imageUrl}
                                    className={cn("border border-background bg-background", isMini ? "size-4" : "size-5")}
                                    fallbackClassName="text-[6px] font-bold text-foreground"
                                />
                            </div>
                        )}
                        
                        {eventCreator && (
                            <div title={`Created by ${eventCreator.name}`} className="relative z-20">
                                <MemberAvatar
                                    name={eventCreator.name}
                                    src={eventCreator.avatar} 
                                    className={cn("border border-background", isMini ? "size-4" : "size-5")}
                                    fallbackClassname="text-[6px] bg-primary text-primary-foreground"
                                />
                            </div>
                        )}
                    </div>

                    {!isMini && <DateIndicator value={date} className="text-[10px]" />}
                </div>
            </div>
        </div>
    );
};