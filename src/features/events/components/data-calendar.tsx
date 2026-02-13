"use client";

import {
    format,
    getDay,
    parse,
    startOfWeek,
    addMonths,
    subMonths,
} from "date-fns";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { enUS } from "date-fns/locale";
import { useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css"; // Ensure this file exists for styling
import { EventsCard } from "./events-card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

// You might need to define an Event type in your types file if not exists
// import { Event } from "../types"; 

// Mock type for now
interface EventType {
    $id: string;
    title: string;
    date: string | Date; // Events usually have a specific date
    description?: string;
    projectId?: string;
    workspaceId?: string;
    segmentId?: string;
    // You might need to fetch full objects for project/segment names to display them
    project?: { name: string, imageUrl?: string }; 
    segment?: { name: string };
}

const locales = {
    "en-US": enUS
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface DataCalendarProps {
    data: EventType[];
}

interface CustomToolbarProps {
    date: Date;
    onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => (
    <div className="flex mb-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start">
        <Button
            onClick={() => onNavigate("PREV")}
            variant="secondry"
            size="icon"
            className="h-8 w-8"
        >
            <ChevronLeftIcon className="size-4" />
        </Button>
        <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto bg-background">
            <CalendarIcon className="size-4 mr-2" />
            <p className="text-sm font-medium">{format(date, "MMMM yyyy")}</p>
        </div>
        <Button
            onClick={() => onNavigate("NEXT")}
            variant="secondry"
            size="icon"
            className="h-8 w-8"
        >
            <ChevronRightIcon className="size-4" />
        </Button>
        <Button
            onClick={() => onNavigate("TODAY")}
            variant="outline"
            size="sm"
            className="h-8 ml-2"
        >
            Today
        </Button>
    </div>
)

export const DataCalendar = ({
    data,
}: DataCalendarProps) => {

    const [value, setValue] = useState(
        data.length > 0 ? new Date(data[0].date) : new Date()
    );

    const events = data.map((event) => ({
        id: event.$id,
        title: event.title,
        start: new Date(event.date),
        end: new Date(event.date), // Assuming single-day events for now
        resource: {
            description: event.description,
            project: event.project, // Pass full object if available
            segment: event.segment,
        }
    }));

    const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
        if (action === "PREV") {
            setValue(subMonths(value, 1));
        } else if (action === "NEXT") {
            setValue(addMonths(value, 1));
        } else if (action === "TODAY") {
            setValue(new Date());
        }
    };

    return (
        <Calendar
            localizer={localizer}
            date={value}
            events={events}
            views={["month"]}
            defaultView="month"
            toolbar
            showAllEvents
            className="h-full w-full"
            max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
            formats={{
                weekdayFormat: (date, culture, localizer) => localizer?.format(date, "EEE", culture) ?? ""
            }}
            components={{
                eventWrapper: ({ event }) => (
                    <EventsCard
                        id={event.id}
                        title={event.title}
                        description={event.resource?.description}
                        project={event.resource?.project}
                        segment={event.resource?.segment}
                    />
                ),
                toolbar: () => (
                    <CustomToolbar date={value} onNavigate={handleNavigate} />
                )
            }}
        />
    )
}