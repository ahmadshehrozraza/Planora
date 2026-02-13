"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NotificationButtonProps {
    collapsed: boolean;
}

const mockNotifications = [
    { id: 1, title: "New Assignment", message: "You have a new task in Website Redesign", read: false },
    { id: 2, title: "Meeting Reminder", message: "Daily Standup in 15 mins", read: false },
    { id: 3, title: "Welcome", message: "Welcome to Planora workspace", read: true },
];

export const NotificationButton = ({ collapsed }: NotificationButtonProps) => {

    const unreadCount = mockNotifications.filter(n => !n.read).length;
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "relative flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-accent/50 outline-none group w-full",
                        collapsed ? "justify-center" : "justify-start"
                    )}
                >
                    <div className="relative">
                        <Bell className="size-5 text-muted-foreground group-hover:text-foreground transition" />


                        {unreadCount > 0 && (
                            <span className={cn(
                                "absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground ring-2 ring-background",
                                collapsed ? "h-3 w-3 -top-0 -right-0" : ""
                            )}>
                                {collapsed ? "" : unreadCount}
                            </span>
                        )}
                    </div>


                    {!collapsed && (
                        <div className="flex flex-1 items-center justify-between overflow-hidden">
                            <span className="truncate text-sm font-medium text-foreground">
                                Notifications
                            </span>
                            {unreadCount > 0 && (
                                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    )}
                </button>
            </DropdownMenuTrigger>


            <DropdownMenuContent
                align={collapsed ? "start" : "center"}
                side={collapsed ? "right" : "top"}
                sideOffset={10}
                className="w-80"
            >
                <DropdownMenuLabel className="flex items-center justify-between font-normal">
                    <span className="font-semibold">Notifications</span>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:text-primary">Mark all read</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto py-1">
                    {mockNotifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No new notifications
                        </div>
                    ) : (
                        mockNotifications.map((notification) => (
                            <DropdownMenuItem key={notification.id} className="cursor-pointer flex flex-col items-start gap-1 p-3 focus:bg-accent">
                                <div className="flex w-full items-center justify-between">
                                    <span className={cn("text-sm font-medium", !notification.read && "text-primary")}>
                                        {notification.title}
                                    </span>
                                    {!notification.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.message}
                                </p>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};