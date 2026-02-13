"use client";

import { cn } from "@/lib/utils";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { LayersIcon } from "lucide-react";

interface EventsCardProps {
    id: string;
    title: string;
    project?: { name: string; imageUrl?: string };
    workspace?: { name: string };
    segment?: { name: string };
    description?: string;
}

export const EventsCard = ({
    id,
    title,
    project,
    segment,
    description,
}: EventsCardProps) => {

    const workspaceId = useWorkspaceId();
    const router = useRouter();

    const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        router.push(`/workspaces/${workspaceId}/events/${id}`);
    };

    return (
        <div className="px-1 w-full overflow-hidden">
            <div 
                onClick={onClick} 
                className={cn(
                    "p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 border-l-blue-500 shadow-sm flex flex-col gap-y-1 cursor-pointer hover:opacity-75 transition",
                    "w-full overflow-hidden" // Ensuring it stays within cell
                )}
            >
                <p className="font-semibold truncate w-full" title={title}>{title}</p>
                
                {/* Hide description on very small widths if needed, or truncate heavily */}
                {description && (
                    <p className="text-[10px] text-muted-foreground truncate w-full hidden xl:block">
                        {description}
                    </p>
                )}

                <div className="flex items-center gap-x-2 mt-1 w-full overflow-hidden">
                    {/* Project Avatar */}
                    {project && (
                        <div className="flex items-center gap-1 shrink-0">
                            <ProjectAvatar
                                name={project.name}
                                image={project.imageUrl}
                                className="size-4"
                                fallbackClassName="text-[8px]"
                            />
                        </div>
                    )}

                    {/* Segment Indicator */}
                    {segment && (
                        <div className="flex items-center gap-1 text-muted-foreground min-w-0">
                            <LayersIcon className="size-3 shrink-0" />
                            <span className="text-[10px] truncate">{segment.name}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};