"use client";

import { cn } from "@/lib/utils";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { Clock, MapPin } from "lucide-react";
import { DateIndicator } from "@/components/date-indicator";
import { differenceInDays, isBefore } from "date-fns";
import { EventTypes } from "../types";
import { Badge } from "@/components/ui/badge";

interface EventsCardProps extends Partial<EventTypes> {
    id: string;
    title: string;
    date: string;
    time: any;
    project: any;
    sprint: any;
    description?: string;
    location?: string | null;
    status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "MISSED";
    eventCreator?: any;
    isOpened: boolean;
    variant?: "default" | "mini";
}

export const EventsCard = ({
    id,
    title,
    date,
    time,
    project,
    sprint,
    description,
    location,
    status,
    eventCreator,
    isOpened,
    variant = "default",
}: EventsCardProps) => {

    const workspaceId = useWorkspaceId();
    const router = useRouter();

    const isMini = variant === "mini";

    const eventDate = new Date(date);
    const today = new Date();
    const diffInDays = differenceInDays(eventDate, today);
    const isPast = isBefore(eventDate, today) && diffInDays < 0;

    let borderColorClass = "border-l-emerald-500"; 

    if (status === "CANCELLED" || status === "MISSED") {
        borderColorClass = "border-l-muted-foreground";
    } else if (status === "COMPLETED") {
        borderColorClass = "border-l-blue-500";
    } else if (isPast && status === "SCHEDULED") {
        borderColorClass = "border-l-rose-600 dark:border-l-rose-500"; // Overdue action required
    } else if (diffInDays <= 3) {
        borderColorClass = "border-l-orange-500 dark:border-l-orange-400"; 
    } else if (diffInDays <= 14) {
        borderColorClass = "border-l-amber-500 dark:border-l-amber-400"; 
    }

    const isInactive = status === "CANCELLED" || status === "COMPLETED" || status === "MISSED";

    const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        router.push(`/workspaces/${workspaceId}/events/${id}`);
    };

    return (
        <div className="w-full">
            <div
                onClick={onClick}
                className={cn(
                    "bg-card text-card-foreground border-border border rounded-lg shadow-sm flex flex-col cursor-pointer transition-all hover:shadow-md hover:bg-accent/50 overflow-hidden relative",
                    isMini ? "p-3 gap-y-2" : "p-4 gap-y-3",
                    "border-l-[4px]", 
                    borderColorClass,
                    isInactive && "opacity-75 grayscale-[30%]"
                )}
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <p className={cn(
                            "font-semibold truncate leading-tight",
                            !isOpened ? "text-foreground font-bold" : "text-muted-foreground",
                            status === "CANCELLED" && "line-through opacity-70",
                            isMini ? "text-xs" : "text-sm"
                        )} title={title}>
                            {title}
                        </p>
                        {!isOpened && (
                            <div className="relative flex h-2 w-2 shrink-0 ml-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </div>
                        )}
                    </div>
                    {status !== "SCHEDULED" && (
                        <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 shadow-none border-border", 
                            status === "COMPLETED" && "bg-blue-500/10 text-blue-600",
                            status === "CANCELLED" && "bg-muted text-muted-foreground line-through"
                        )}>
                            {status}
                        </Badge>
                    )}
                    {(isPast && status === "SCHEDULED") && (
                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0 shadow-none">ACTION REQUIRED</Badge>
                    )}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground w-full flex-wrap">
                    {time && (
                        <div className="flex items-center gap-1 shrink-0 bg-muted/50 px-1.5 py-0.5 rounded-md border border-border">
                            <Clock className={cn("shrink-0", isMini ? "size-3" : "size-3.5")} />
                            <span className={cn("font-medium text-foreground", isMini ? "text-[10px]" : "text-xs")}>{time}</span>
                        </div>
                    )}
                    {location && (
                        <div className="flex items-center gap-1 min-w-0 bg-muted/30 px-1.5 py-0.5 rounded-md border border-border">
                            <MapPin className={cn("shrink-0 text-muted-foreground", isMini ? "size-3" : "size-3.5")} />
                            <span className={cn("truncate text-muted-foreground max-w-[120px]", isMini ? "text-[10px]" : "text-xs")} title={location}>{location}</span>
                        </div>
                    )}
                    {sprint && (
                        <div className="flex items-center gap-1 min-w-0">
                             {!isMini && <span className="text-muted-foreground/50">•</span>}
                             <span className="truncate text-xs text-muted-foreground opacity-90 max-w-[100px]" title={sprint.name}>
                                {sprint.name}
                             </span>
                        </div>
                    )}
                </div>

                {!isMini && description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {description}
                    </p>
                )}

                <div className={cn(
                    "flex items-center justify-between mt-2",
                    !isMini && "border-t border-dashed border-border pt-3"
                )}>
                    <div className="flex items-center -space-x-2">
                        {project && (
                            <div title={project.name} className="relative z-10">
                                <ProjectAvatar
                                    name={project.name}
                                    image={project.imageUrl}
                                    className={cn("border-2 border-background bg-background", isMini ? "size-5" : "size-6")}
                                    fallbackClassName="text-[8px] font-bold text-foreground"
                                />
                            </div>
                        )}
                        
                        {eventCreator && (
                            <div title={`Created by ${eventCreator.name}`} className="relative z-20">
                                <MemberAvatar
                                    name={eventCreator.name}
                                    src={eventCreator.avatar} 
                                    className={cn("border-2 border-background", isMini ? "size-5" : "size-6")}
                                    fallbackClassname="text-[8px] bg-primary text-primary-foreground"
                                />
                            </div>
                        )}
                    </div>

                    {!isMini && <DateIndicator value={date} className={cn("text-xs font-medium", isPast && status === "SCHEDULED" && "text-destructive font-bold")} />}
                </div>
            </div>
        </div>
    );
};