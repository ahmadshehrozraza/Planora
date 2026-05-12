"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { PlusIcon, CalendarDays, Clock, FolderGit2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { CreateEventModal } from "@/features/events/components/create-event-modal";
import { useCreateEventModal } from "@/features/events/hooks/use-create-event-modal";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { cn } from "@/lib/utils";

interface EventsListProps {
    data: any[];
}

export const EventsList = ({ data }: EventsListProps) => {
    const workspaceId = useWorkspaceId();
    const { open } = useCreateEventModal();
    if (!workspaceId) return null;

    const { data: permissions } = useGetPermissions( workspaceId );
    const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];
    
    const allowed = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.EVENT_CREATE);

    return (
        <div className="flex flex-col col-span-1">
            <CreateEventModal /> 
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-base font-bold text-foreground flex items-center gap-2">
                        <CalendarDays className="size-4 text-primary" />
                        Upcoming Events <span className="text-muted-foreground font-normal text-xs ml-1">({data.length})</span>
                    </p>

                    {allowed && (
                    <Button variant="ghost" size="icon" className="size-8 hover:bg-primary/10 hover:text-primary" onClick={open}>
                        <PlusIcon className="size-4" />
                    </Button>
                    )}
                </div>
                <Separator className="my-4 bg-border/60" />

                <ul className="space-y-2.5">
                    {data.map((event) => (
                        <li key={event.id}>
                            <Link href={`/workspaces/${workspaceId}/events/${event.id}`}>
                                <Card className="shadow-none rounded-lg hover:bg-accent/40 transition-colors duration-200 p-0 border border-border/60 bg-transparent group relative">
                                    <CardContent className="p-3">
                                        <div className="flex items-start gap-4">
                                            <div className="size-10 shrink-0 bg-primary/10 rounded-lg flex flex-col items-center justify-center border border-primary/20 text-primary">
                                                <span className="text-[9px] font-bold uppercase leading-none tracking-widest mt-0.5">
                                                    {event.date ? format(new Date(event.date), 'MMM') : 'N/A'}
                                                </span>
                                                <span className="text-sm font-extrabold leading-none mt-1">
                                                    {event.date ? format(new Date(event.date), 'dd') : '--'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex flex-col min-w-0 flex-1 justify-center py-0.5">
                                                <div className="flex items-center gap-1.5 min-w-0 pr-4">
                                                    <p className={cn("text-sm truncate group-hover:text-primary transition-colors", !event.isOpened ? "font-bold text-foreground" : "font-semibold text-foreground")}>
                                                        {event.title}
                                                    </p>
                                                    {!event.isOpened && (
                                                        <div className="relative flex h-2 w-2 shrink-0">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                    <div className="flex items-center gap-x-1.5 shrink-0 text-muted-foreground">
                                                        <Clock className="size-3" />
                                                        <span className="text-[10px] font-medium">{event.date ? format(new Date(event.date), 'hh:mm a') : 'All Day'}</span>
                                                    </div>
                                                    {event.project?.name && (
                                                        <div className="flex items-center gap-x-1.5 min-w-0 text-muted-foreground border-l border-border/60 pl-2">
                                                            <FolderGit2 className="size-3 shrink-0" />
                                                            <span className="text-[10px] font-medium truncate max-w-[100px]">{event.project.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </li>
                    ))}

                    {data.length === 0 && (
                        <li className="text-center py-6">
                            <div className="text-muted-foreground flex flex-col items-center">
                                <div className="size-10 bg-muted/50 rounded-full flex items-center justify-center mb-2">
                                    <CalendarDays className="size-5 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm font-medium text-foreground">No upcoming events</p>
                                <p className="text-xs mt-0.5">Your schedule is clear for the next 7 days.</p>
                            </div>
                        </li>
                    )}
                </ul>

                <Button variant="secondary" className="mt-4 w-full bg-muted/50 hover:bg-muted font-medium text-xs h-9" asChild>
                    <Link href={`/workspaces/${workspaceId}/events`}>View All Events</Link>
                </Button>
            </div>
        </div>
    );
};