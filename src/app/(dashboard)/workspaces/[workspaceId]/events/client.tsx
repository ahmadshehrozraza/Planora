"use client";

import React, { useState, useMemo, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon, ArrowRight, ArrowLeft, Layers, Plus } from "lucide-react";

import { DataCalendar } from "@/features/events/components/data-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useCreateEventModal } from "@/features/events/hooks/use-create-event-modal";
import { CreateEventModal } from "@/features/events/components/create-event-modal";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { PageError } from "@/components/page-error";
import { useGetEvents } from "@/features/events/api/use-get-events";
import { EventFilters } from "@/features/events/components/event-filters";
import { useEventFilters } from "@/features/events/hooks/use-event-filters";
import { EventsCard } from "@/features/events/components/events-card";
import { PageLoader } from "@/components/page-loader";
import { EventTypes } from "@/features/events/types";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";

const EventsClientPage = () => {
  const { open } = useCreateEventModal();
  const workspaceId = useWorkspaceId();

  const [{ projectId, date }] = useEventFilters();

  const { data, isLoading, isError } = useGetEvents({
    workspaceId,
    projectId,
    sprintId: null, 
  });

  const { data: permissions } = useGetPermissions( workspaceId );
  const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];
  const allowed = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.EVENT_CREATE);

  const events: EventTypes[] = data || [];

  const [view, setView] = useState<"TODAY" | "ALL">("TODAY");

  const toggleView = useCallback(() => {
    setView((prev) => (prev === "TODAY" ? "ALL" : "TODAY"));
  }, []);

  const displayedEvents = useMemo(() => {
    if (!events.length) return [];

    const targetDate = date ? parseISO(date) : new Date();

    if (view === "TODAY") {
      return events.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getDate() === targetDate.getDate() &&
          eventDate.getMonth() === targetDate.getMonth() &&
          eventDate.getFullYear() === targetDate.getFullYear()
        );
      });
    }

    return [...events].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [events, view, date]);

  if (isError) return <PageError message="Failed to load events" />;

  return (
    <div className="flex flex-col h-full w-full space-y-4 p-4 overflow-hidden bg-background">
      <CreateEventModal />
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shrink-0">
        <div className="w-full lg:w-auto">
          <EventFilters />
        </div>

        {allowed && (
        <Button onClick={open} className="w-full lg:w-auto shadow-sm" size="sm">
          <Plus className="size-4 mr-2" />
          New Event
        </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <div className="flex-1 bg-card rounded-xl shadow-sm border border-border flex flex-col min-h-0 overflow-hidden relative">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <PageLoader />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              <DataCalendar data={events} />
            </div>
          )}
        </div>

        <div className="lg:w-[340px] shrink-0 flex flex-col h-full min-h-0">
          <Card className="h-full flex flex-col border border-border shadow-sm bg-card overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30 border-b border-border flex flex-row items-center justify-between space-y-0 p-4 shrink-0 h-[68px]">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  {view === "TODAY" ? (
                    <>
                      <CalendarIcon className="size-4 text-primary" />{" "}
                      {date ? "Selected Date" : "Today"}
                    </>
                  ) : (
                    <>
                      <Layers className="size-4 text-purple-600 dark:text-purple-400" /> All Events
                    </>
                  )}
                </CardTitle>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                  {view === "TODAY"
                    ? format(date ? parseISO(date) : new Date(), "EEEE, MMM do")
                    : `${events.length} Events Total`}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleView} className="h-7 w-7 hover:bg-accent text-muted-foreground">
                {view === "TODAY" ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
              </Button>
            </CardHeader>

            <CardContent className="flex-1 p-0 min-h-0 overflow-hidden bg-background">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-3">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-lg" />
                    ))
                  ) : displayedEvents.length > 0 ? (
                    displayedEvents.map((event) => (
                      <EventsCard
                        key={event.id}
                        id={event.id}
                        title={event.title}
                        date={event.date}
                        time={event.time}
                        location={event.location}
                        status={event.status}
                        description={event.description || undefined}
                        project={event.project || undefined}
                        sprint={event.sprint || undefined} 
                        eventCreator={event.eventCreator}
                        isOpened={event.isOpened}
                        variant="default"
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-60 text-center space-y-3 px-4">
                      <div className="p-4 rounded-full bg-muted ring-1 ring-border">
                        <CalendarIcon className="size-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">No events found</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                          {view === "TODAY"
                            ? "Looks like you have a free day! Enjoy your time."
                            : "No upcoming events scheduled."}
                        </p>
                      </div>

                      {allowed && (
                      <Button variant="outline" size="sm" onClick={open} className="mt-2 h-8 text-xs bg-background border-border">
                        Create one now
                      </Button>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventsClientPage;