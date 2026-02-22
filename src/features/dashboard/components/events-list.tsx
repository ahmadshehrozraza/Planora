"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { PlusIcon, CalendarDays, Clock, FolderGit2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { EventTypes } from "@/features/events/types"; 
import { CreateEventModal } from "@/features/events/components/create-event-modal";
import { useCreateEventModal } from "@/features/events/hooks/use-create-event-modal";

interface EventsListProps {
    data: EventTypes[];
    total: number;
}

export const EventsList = ({ data, total }: EventsListProps) => {
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    const { open } = useCreateEventModal();

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <CreateEventModal />
            <div className="bg-muted/50 border border-border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-foreground">
                        Upcoming Events ({total})
                    </p>
                    <Button variant="outline" size="icon" className="bg-background" onClick={open}>
                        <PlusIcon className="size-4 text-foreground" />
                    </Button>
                </div>
                <Separator className="my-2 bg-border" />

                <ul className="space-y-2">
                    {data.map((event) => {
                        return (
                            <li key={event.$id}>
                                <Link href={`/workspaces/${workspaceId}/events/${event.$id}`}>
                                    <Card className={`shadow-none rounded-lg hover:bg-accent/50 transition p-0 border border-border hover:border-primary/40 ${event.opened ? 'bg-background' : 'bg-card'}`}>
                                        <CardContent className="p-4">
                                            <div className="flex flex-col gap-y-2">
                                                <div className="flex items-start justify-between w-full gap-4">
                                                    
                                                    <div className="flex items-center gap-3 min-w-0 w-full">
                                                        <div className="size-11 shrink-0 bg-primary/10 rounded-md flex flex-col items-center justify-center border border-primary/20 text-primary">
                                                            <span className="text-[10px] font-bold uppercase leading-none tracking-wider mt-0.5">
                                                                {event.date ? format(new Date(event.date), 'MMM') : 'N/A'}
                                                            </span>
                                                            <span className="text-lg font-extrabold leading-none mt-1">
                                                                {event.date ? format(new Date(event.date), 'dd') : '--'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col min-w-0 flex-1">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="text-base font-medium text-foreground truncate">
                                                                    {event.title}
                                                                </p>
                                                                {!event.opened && (
                                                                    <span className="shrink-0 size-2 bg-blue-500 rounded-full"></span>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                                                                <div className="flex items-center gap-x-1.5 shrink-0">
                                                                    <Clock className="size-3.5" />
                                                                    <span>{event.time}</span>
                                                                </div>
                                                                
                                                                {event.project?.name && (
                                                                    <div className="flex items-center gap-x-1.5 truncate">
                                                                        <FolderGit2 className="size-3.5 shrink-0" />
                                                                        <span className="truncate">{event.project.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </li>
                        )
                    })}

                    {data.length === 0 && (
                        <li className="text-center py-8">
                            <div className="text-muted-foreground">
                                <div className="mx-auto size-12 bg-muted rounded-full flex items-center justify-center mb-3">
                                    <CalendarDays className="size-6 text-muted-foreground/70" />
                                </div>
                                <p className="text-lg font-medium text-foreground">No upcoming events</p>
                                <p className="text-sm">Schedule your first event to get started</p>
                            </div>
                        </li>
                    )}
                </ul>

                <Button variant="secondary" className="mt-3 w-full bg-background hover:bg-muted/50" asChild>
                    <Link href={`/workspaces/${workspaceId}/events`}>
                        View All Events
                    </Link>
                </Button>
            </div>
        </div>
    );
};