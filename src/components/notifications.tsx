"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const mockNotifications = [
  { 
    id: 1, 
    title: "New Assignment", 
    message: "You have been assigned to 'Website Redesign'", 
    time: "2m ago",
    read: false
  },
  { 
    id: 2, 
    title: "Meeting Reminder", 
    message: "Daily Standup starts in 15 minutes", 
    time: "15m ago",
    read: false
  },
  { 
    id: 3, 
    title: "Welcome to Planora", 
    message: "Get started by creating your first workspace.", 
    time: "1d ago",
    read: true
  },
];

export const NotificationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group/notif-btn relative w-full justify-start h-8 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >

          <div className="relative flex items-center justify-center shrink-0">
            <Bell className="size-4 text-muted-foreground transition-colors group-hover/notif-btn:text-foreground" />

            {unreadCount > 0 && (
              <span className={cn(
                "absolute -right-1 -top-1 flex size-3 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white ring-2 ring-background",
                "group-data-[collapsible=icon]:right-0 group-data-[collapsible=icon]:top-0 group-data-[collapsible=icon]:size-2.5 group-data-[collapsible=icon]:ring-1" 
              )}>
                <span className="group-data-[collapsible=icon]:hidden">
                    {unreadCount}
                </span>
              </span>
            )}
          </div>

          <div className="ml-2 flex flex-1 items-center justify-between overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-medium text-muted-foreground group-hover/notif-btn:text-foreground transition-colors">
                  Notifications
              </span>
              {unreadCount > 0 && (
                  <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] font-medium text-primary">
                      {unreadCount}
                  </span>
              )}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80"
        align="start" 
        side="right" 
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center justify-between py-3 font-normal">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
                <span 
                    role="button"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                >
                    <Check className="size-3" />
                    Mark all read
                </span>
            )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {mockNotifications.length === 0 ? (
                <div className="flex h-16 items-center justify-center text-xs text-muted-foreground italic">
                    No new notifications
                </div>
            ) : (
                <div className="flex flex-col gap-1 p-1">
                    {mockNotifications.map((item) => (
                        <DropdownMenuItem 
                            key={item.id} 
                            className={cn(
                                "cursor-pointer flex flex-col items-start gap-1 p-2.5 transition-colors focus:bg-accent rounded-md",
                                !item.read && "bg-muted/40"
                            )}
                        >
                            <div className="flex w-full items-center justify-between gap-2">
                                <span className={cn(
                                    "text-sm font-medium leading-none",
                                    !item.read ? "text-foreground" : "text-muted-foreground"
                                )}>
                                    {item.title}
                                </span>
                                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground whitespace-nowrap">
                                    <Clock className="size-2.5" />
                                    {item.time}
                                </span>
                            </div>
                            
                            <p className="line-clamp-2 text-xs text-muted-foreground w-full">
                                {item.message}
                            </p>
                        </DropdownMenuItem>
                    ))}
                </div>
            )}
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  );
};