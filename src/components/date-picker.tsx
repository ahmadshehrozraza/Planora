"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    value: Date | undefined;
    onChange: (date: Date) => void;
    className?: string;
    placeholder?: string;
}

export const DatePicker = ({
    value, onChange, className, placeholder = "Select Date"
}: DatePickerProps) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            // ✅ TIMEZONE FIX: Pakistan timezone (UTC+5) ke hisaab se date set karein
            // Yeh ensure karega ke selected date exactly same rahe
            const localDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                12, 0, 0, 0 // Fixed noon time in local timezone
            );
            
            onChange(localDate);
            setIsOpen(false);
        }
    };

    // ✅ Display value bhi local timezone mein format karein
    const displayValue = value ? format(value, "PPP") : null;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                        "w-full justify-start text-left font-normal px-3",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {displayValue || <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
                <Calendar 
                    mode="single"
                    selected={value}
                    onSelect={handleDateSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}