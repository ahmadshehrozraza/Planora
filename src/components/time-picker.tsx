"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface ScrollTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string; // 👈 Yeh zaroori hai taake bahar se height control ho sake
}

export function ScrollTimePicker({ date, setDate, className }: ScrollTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Arrays for Dropdown options
  const hours = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, ... 12]
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // [0, 5, 10 ... 55]

  const handleTimeChange = (type: "hour" | "minute" | "ampm", value: string) => {
    const newDate = date ? new Date(date) : new Date();
    
    if (type === "hour") {
      const currentHours = newDate.getHours();
      const isPM = currentHours >= 12;
      let newHour = parseInt(value);
      
      // Logic to preserve AM/PM when changing numbers
      if (isPM && newHour !== 12) newHour += 12;
      if (!isPM && newHour === 12) newHour = 0;
      
      newDate.setHours(newHour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value));
    } else if (type === "ampm") {
      const currentHours = newDate.getHours();
      if (value === "PM" && currentHours < 12) {
        newDate.setHours(currentHours + 12);
      } else if (value === "AM" && currentHours >= 12) {
        newDate.setHours(currentHours - 12);
      }
    }
    
    setDate(newDate);
  };

  // Current Selection for highlighting
  const selectedHour = date ? parseInt(format(date, "h")) : 12;
  const selectedMinute = date ? parseInt(format(date, "m")) : 0;
  const selectedAmpm = date ? format(date, "a") : "AM";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            // 👇 Default height h-10 rakhi hai, jo form ke saath align hogi
            "h-10", 
            !date && "text-muted-foreground",
            className // Bahar se aane wali classes override kar sakengi
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {date ? format(date, "h:mm a") : "Pick time"}
        </Button>
      </PopoverTrigger>
      
      {/* 👇 YEH CONTENT MISSING THA, ISLIYE KHUL NAHI RAHA THA */}
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex h-[200px] divide-x">
          
          {/* HOURS COLUMN */}
          <ScrollArea className="h-full w-[70px]">
            <div className="flex flex-col p-2">
              {hours.map((hour) => (
                <Button
                  key={hour}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "shrink-0 my-1",
                    selectedHour === hour && "bg-blue-100 text-blue-700 font-bold hover:bg-blue-200"
                  )}
                  onClick={() => handleTimeChange("hour", hour.toString())}
                >
                  {hour}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* MINUTES COLUMN */}
          <ScrollArea className="h-full w-[70px]">
            <div className="flex flex-col p-2">
              {minutes.map((minute) => (
                <Button
                  key={minute}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "shrink-0 my-1",
                    // Highlight logic: agar minute pass ho (e.g. 13) to nearest 10 highlight kare
                    Math.abs(selectedMinute - minute) < 5 && selectedMinute >= minute && "bg-blue-100 text-blue-700 font-bold hover:bg-blue-200"
                  )}
                  onClick={() => handleTimeChange("minute", minute.toString())}
                >
                  {minute.toString().padStart(2, "0")}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* AM/PM COLUMN */}
          <ScrollArea className="h-full w-[70px]">
            <div className="flex flex-col p-2 h-full justify-center gap-2">
              {["AM", "PM"].map((ampm) => (
                <Button
                  key={ampm}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "shrink-0 my-1",
                    selectedAmpm === ampm && "bg-blue-100 text-blue-700 font-bold hover:bg-blue-200"
                  )}
                  onClick={() => handleTimeChange("ampm", ampm)}
                >
                  {ampm}
                </Button>
              ))}
            </div>
          </ScrollArea>

        </div>
      </PopoverContent>
    </Popover>
  );
}