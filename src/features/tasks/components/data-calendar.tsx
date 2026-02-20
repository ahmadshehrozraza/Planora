"use client";

import { Task } from "../types";
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
import "./data-calendar.css";
import { EventCard } from "./event-card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

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
    data: Task[];
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

    const [ value, setValue ] = useState(
        data.length > 0 ? new Date(data[0].endDate) : new Date()
    );

    const events = data.map((task) => ({
        start: new Date(task.startDate),
        end: new Date(task.endDate),
        title: task.name,
        project: task.projectId,
        assignee: task.assigneeId,
        status: task.taskStatus,
        id: task.id,
    }));

    const handleNavigate = (action: "PREV" | "NEXT" | "TODAY" ) => {
        if (action === "PREV"){
            setValue(subMonths(value, 1));
        } else if( action === "NEXT"){
            setValue(addMonths(value, 1));
        } else if( action === "TODAY"){
            setValue(new Date());
        }
    };

    const eventPropGetter = () => {
        return {
            style: {
                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
                outline: 'none'
            }
        };
    };

    return(
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
            eventPropGetter={eventPropGetter}
            components={{
                event: ({ event }) => (
                    <EventCard
                        id={event.id as string}
                        title={event.title as string}
                        assignee={event.assignee}
                        project={event.project}
                        status={event.status as any}
                    />
                ),
                toolbar: () => (
                    <CustomToolbar date={value} onNavigate={handleNavigate} />
                )
            }}
         />
    )
}