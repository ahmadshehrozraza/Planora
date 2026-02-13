"use client";

import React, { useState } from "react";
import { addHours, format, startOfToday, subDays, addDays } from "date-fns";
import { CalendarIcon, Clock, ArrowRight, ArrowLeft, Layers } from "lucide-react";
import { useRouter } from "next/navigation";

import { DataCalendar } from "@/features/events/components/data-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useCreateEventModal } from "@/features/events/hooks/use-create-event-modal";
import { CreateEventModal } from "@/features/events/components/create-event-modal";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

const today = startOfToday();
const dummyEvents = [
  // Today's Events
  {
    $id: "evt_001",
    title: "Website Redesign Review",
    date: addHours(today, 10).toISOString(),
    description: "Reviewing the new homepage mockups.",
    project: { name: "Website Redesign", imageUrl: "" },
    segment: { name: "UI/UX Design" },
    assignee: { name: "Alice" },
    status: "IN_PROGRESS"
  },
  {
    $id: "evt_002",
    title: "Client Meeting - Mobile App",
    date: addHours(today, 14).toISOString(),
    description: "Discussing the core features for the MVP.",
    project: { name: "Mobile App", imageUrl: "" },
    segment: { name: "Requirements" },
    assignee: { name: "Bob" },
    status: "TODO"
  },
  // Future Events
  {
    $id: "evt_003",
    title: "Backend API Integration",
    date: addDays(today, 2).toISOString(),
    description: "Integrating Stripe payment gateway.",
    project: { name: "E-commerce Platform", imageUrl: "" },
    segment: { name: "Backend" },
    assignee: { name: "Charlie" },
    status: "IN_PROGRESS"
  },
  {
    $id: "evt_005",
    title: "Team Lunch",
    date: addDays(today, 5).toISOString(),
    description: "Monthly team bonding lunch.",
    project: { name: "General", imageUrl: "" },
    segment: { name: "Social" },
    assignee: { name: "Eve" },
    status: "TODO"
  },
  {
    $id: "evt_006",
    title: "Q1 Marketing Strategy",
    date: addDays(today, 7).toISOString(),
    description: "Planning the marketing campaign for Q1.",
    project: { name: "Marketing", imageUrl: "" },
    segment: { name: "Strategy" },
    assignee: { name: "Frank" },
    status: "TODO"
  },
  // Past Events
  {
    $id: "evt_004",
    title: "Sprint Planning",
    date: subDays(today, 2).toISOString(),
    description: "Planning tasks for Sprint 42.",
    project: { name: "Internal Tools", imageUrl: "" },
    segment: { name: "Planning" },
    assignee: { name: "David" },
    status: "DONE"
  },
  {
    $id: "evt_007",
    title: "Bug Triage",
    date: subDays(today, 1).toISOString(),
    description: "Sorting through user reported bugs.",
    project: { name: "Mobile App", imageUrl: "" },
    segment: { name: "QA" },
    assignee: { name: "Grace" },
    status: "DONE"
  },
  {
    $id: "evt_008",
    title: "Design System Workshop",
    date: subDays(today, 3).toISOString(),
    description: "Standardizing UI components.",
    project: { name: "Website Redesign", imageUrl: "" },
    segment: { name: "Design System" },
    assignee: { name: "Alice" },
    status: "DONE"
  }
];

const CalendarPage = () => {
  const { open } = useCreateEventModal();
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  
  const [view, setView] = useState<"TODAY" | "ALL">("TODAY");

  const handleEventClick = (id: string) => {
    router.push(`/workspaces/${workspaceId}/events/${id}`);
  };

  const toggleView = () => {
    setView((prev) => (prev === "TODAY" ? "ALL" : "TODAY"));
  };

  // Filter Logic
  const todaysEvents = dummyEvents.filter(event => {
    const eventDate = new Date(event.date);
    const todayDate = new Date();
    return (
        eventDate.getDate() === todayDate.getDate() &&
        eventDate.getMonth() === todayDate.getMonth() &&
        eventDate.getFullYear() === todayDate.getFullYear()
    );
  });

  // Decide which list to show based on state
  // For "All Events", let's sort them by date (Newest first or upcoming)
  const displayedEvents = view === "TODAY" 
    ? todaysEvents 
    : [...dummyEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col h-full space-y-4 p-0">
      <CreateEventModal/>

      <div className="flex items-center justify-end">
        <Button
            onClick={open}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
        >
            New Event
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-[calc(100vh-120px)] min-h-[600px]">
        
        {/* --- MAIN CALENDAR (Left Side) --- */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border p-4 h-full flex flex-col">
            <div className="flex-1 min-h-0">
                <DataCalendar data={dummyEvents} />
            </div>
        </div>

        {/* --- SIDEBAR (Right Side) --- */}
        <div className="lg:col-span-1 h-full min-w-[270px]">
            <Card className="h-full flex flex-col border-none shadow-sm bg-white">
                <CardHeader className="pb-3 bg-slate-50/50 border-b flex flex-row items-center justify-between space-y-0 p-4">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            {view === "TODAY" ? (
                                <>
                                    <CalendarIcon className="size-5 text-blue-600" />
                                    Today's Events
                                </>
                            ) : (
                                <>
                                    <Layers className="size-5 text-purple-600" />
                                    All Events
                                </>
                            )}
                        </CardTitle>
                        {/* Dynamic Subtext */}
                        <p className="text-xs text-muted-foreground mt-1">
                            {view === "TODAY" 
                                ? format(new Date(), "EEEE, MMMM do, yyyy") // Full Date
                                : `${dummyEvents.length} total events scheduled`
                            }
                        </p>
                    </div>
                    
                    {/* Toggle Button */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleView} 
                        title={view === "TODAY" ? "View All Events" : "View Today's Events"}
                    >
                        {view === "TODAY" ? (
                            <ArrowRight className="size-4 text-muted-foreground hover:text-blue-600 transition-colors" />
                        ) : (
                            <ArrowLeft className="size-4 text-muted-foreground hover:text-blue-600 transition-colors" />
                        )}
                    </Button>
                </CardHeader>
                
                <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-4">
                            {displayedEvents.length > 0 ? (
                                displayedEvents.map((event) => (
                                    <div 
                                        key={event.$id} 
                                        onClick={() => handleEventClick(event.$id)}
                                        className="flex flex-col gap-2 p-3 rounded-lg border bg-card hover:bg-accent/5 hover:border-blue-200 transition-all cursor-pointer group shadow-sm"
                                    >
                                        {/* Time & Title */}
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-semibold truncate group-hover:text-blue-600 transition-colors">
                                                    {event.title}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                    <Clock className="size-3" />
                                                    {/* Show full date if in 'All' view, otherwise just time */}
                                                    {view === "ALL" 
                                                        ? format(new Date(event.date), "MMM d, h:mm a")
                                                        : format(new Date(event.date), "h:mm a")
                                                    }
                                                </span>
                                            </div>
                                            <ProjectAvatar 
                                                name={event.project?.name} 
                                                className="size-6 shrink-0" 
                                                fallbackClassName="text-[8px]"
                                            />
                                        </div>

                                        {event.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {event.description}
                                            </p>
                                        )}

                                        <Separator className="my-1" />

                                        {/* Footer */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <MemberAvatar 
                                                    name={event.assignee?.name} 
                                                    className="size-5"
                                                    fallbackClassname="text-[8px]" 
                                                />
                                                <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                                                    {event.assignee?.name}
                                                </span>
                                            </div>
                                            
                                            {event.segment && (
                                                <span className="px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 text-[10px] font-medium truncate max-w-[80px]">
                                                    {event.segment.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-center space-y-2 mt-10">
                                    <div className="p-3 rounded-full bg-slate-100">
                                        <CalendarIcon className="size-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-900">
                                        {view === "TODAY" ? "No events today" : "No events found"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {view === "TODAY" ? "Relax and recharge!" : "Try creating a new event."}
                                    </p>
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

export default CalendarPage;