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
import { useState, useCallback, useMemo } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css";

import { TaskCalendarCard } from "./calendar-card"; 
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface DataCalendarProps {
    data: any[]; 
}

interface CustomToolbarProps {
    date: Date;
    onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => (
    <div className="flex mb-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start">
        <Button onClick={() => onNavigate("PREV")} variant="secondary" size="icon" className="h-8 w-8 text-foreground">
            <ChevronLeftIcon className="size-4" />
        </Button>
        <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto bg-background">
            <CalendarIcon className="size-4 mr-2 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">{format(date, "MMMM yyyy")}</p>
        </div>
        <Button onClick={() => onNavigate("NEXT")} variant="secondary" size="icon" className="h-8 w-8 text-foreground">
            <ChevronRightIcon className="size-4" />
        </Button>
        <Button onClick={() => onNavigate("TODAY")} variant="outline" size="sm" className="h-8 ml-2 bg-background border-border text-foreground">
            Today
        </Button>
    </div>
);

const CustomEvent = ({ event }: any) => (
    <TaskCalendarCard
        id={event.id}
        title={event.title}
        assignee={event.assignee}
        project={event.project}
        status={event.status}
    />
);

export const DataCalendar = ({ data }: DataCalendarProps) => {
    const [value, setValue] = useState(
        data.length > 0 && data[0].dueDate ? new Date(data[0].dueDate) : new Date()
    );

    const tasks = useMemo(() => data.map((task) => {
        const exactDate = task.dueDate ? new Date(task.dueDate) : new Date();
        
        return {
            id: task.id,
            title: task.name,
            start: exactDate,
            end: exactDate,
            project: task.project?.name || "Unknown Project", 
            assignee: task.assignee?.name || "Unassigned", 
            status: task.column?.name || "Unknown Status", 
        };
    }), [data]);

    const handleNavigate = useCallback((action: "PREV" | "NEXT" | "TODAY") => {
        if (action === "PREV") setValue(prev => subMonths(prev, 1));
        else if (action === "NEXT") setValue(prev => addMonths(prev, 1));
        else if (action === "TODAY") setValue(new Date());
    }, []);

    const eventPropGetter = useCallback(() => ({
        style: {
            backgroundColor: 'transparent',
            border: 'none',
            padding: 0,
            outline: 'none'
        }
    }), []);

    const calendarComponents = useMemo(() => ({
        event: CustomEvent,
        toolbar: () => <CustomToolbar date={value} onNavigate={handleNavigate} />
    }), [value, handleNavigate]);

    return(
        <Calendar
            localizer={localizer}
            date={value}
            events={tasks}
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
            components={calendarComponents}
         />
    );
};