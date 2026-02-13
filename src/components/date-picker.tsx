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
    disabled?: boolean;
    fromDate?: Date;
    toDate?: Date;
}

export const DatePicker = ({
    value, 
    onChange, 
    className, 
    placeholder = "Select Date",
    disabled = false,
    fromDate,
    toDate
}: DatePickerProps) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            const localDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                12, 0, 0, 0
            );
            
            onChange(localDate);
            setIsOpen(false);
        }
    };

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
                        disabled && "opacity-50 cursor-not-allowed",
                        className
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                        {displayValue || placeholder}
                    </span>
                </Button>
            </PopoverTrigger>

            <PopoverContent 
                className="w-auto p-0" 
                side="bottom" 
                 > 
                    <Calendar 
                        mode="single" 
                        selected={value} 
                        onSelect={handleDateSelect} 
                        initialFocus disabled={disabled} 
                        fromDate={fromDate} toDate={toDate} 
                    /> 
                </PopoverContent>
        </Popover>
    );
};