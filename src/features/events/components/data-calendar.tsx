"use client";

import {
    format,
    getDay,
    parse,
    parseISO,
    startOfWeek,
    addMonths,
    subMonths,
} from "date-fns";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { enUS } from "date-fns/locale";
import { useState, useEffect } from "react"; 
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css";
import { EventsCard } from "./events-card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { EventTypes } from "../types";
import { useEventFilters } from "../hooks/use-event-filters"; // ✨ Hook import kiya hai

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
    data: EventTypes[];
}

interface CustomToolbarProps {
    date: Date;
    onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => (
    <div className="flex mb-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start">
        <Button
            onClick={() => onNavigate("PREV")}
            variant="secondary"
            size="icon"
            className="h-8 w-8 text-foreground"
        >
            <ChevronLeftIcon className="size-4" />
        </Button>
        <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto bg-background">
            <CalendarIcon className="size-4 mr-2 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">{format(date, "MMMM yyyy")}</p>
        </div>
        <Button
            onClick={() => onNavigate("NEXT")}
            variant="secondary"
            size="icon"
            className="h-8 w-8 text-foreground"
        >
            <ChevronRightIcon className="size-4" />
        </Button>
        <Button
            onClick={() => onNavigate("TODAY")}
            variant="outline"
            size="sm"
            className="h-8 ml-2 bg-background border-border text-foreground"
        >
            Today
        </Button>
    </div>
)

export const DataCalendar = ({
    data,
}: DataCalendarProps) => {

    const [{ date: filterDate }] = useEventFilters(); 

    const [value, setValue] = useState(
        filterDate ? parseISO(filterDate) : new Date()
    );

    useEffect(() => {
        if (filterDate) {
            setValue(parseISO(filterDate));
        }
    }, [filterDate]);

    const events = data.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.date),
        end: new Date(event.date), 
        resource: {
            description: event.description,
            project: event.project, 
            segment: event.segment,
            time: event.time,
            opened: event.opened,
            eventCreator: event.eventCreator
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
            className="h-full w-full bg-muted/40 text-foreground"
            max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
            formats={{
                weekdayFormat: (date, culture, localizer) => localizer?.format(date, "EEE", culture) ?? ""
            }}
            components={{
                eventWrapper: ({ event }) => (
                    <EventsCard
                        id={event.id as string}
                        title={event.title as string}
                        date={event.start.toISOString()} 
                        time={event.resource?.time}     
                        project={event.resource?.project}
                        description={event.resource?.description}
                        segment={event.resource?.segment}
                        opened={event.resource?.opened}
                        eventCreator={event.resource?.eventCreator}
                        variant="mini" 
                    />
                ),
                toolbar: () => (
                    <CustomToolbar date={value} onNavigate={handleNavigate} />
                )
            }}
        />
    )
}