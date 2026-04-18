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
import { Bell, CheckCircle2, Clock, Info, UserPlus, Edit3, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useGetNotifications } from "@/features/notifications/api/use-get-notifications";
import { useMarkNotificationRead } from "@/features/notifications/api/use-mark-notification-read";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NotificationItem = {
    id: string;
    isRead: boolean;
    entityType: string;
    workspaceId: string;
    entityId: string;
    action: string;
    title: string;
    message: string;
    createdAt: string | Date;
    actor?: {
        name?: string | null;
        image?: string | null;
    } | null;
};

export const NotificationButton = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [], isLoading } = useGetNotifications();
  const { mutate: markAsRead } = useMarkNotificationRead();

  const unreadCount = notifications?.filter((n: NotificationItem) => !n.isRead).length || 0;

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markAsRead({ notificationId: notification.id });
    }

    if (notification.entityType === "TASK") {
      router.push(`/workspaces/${notification.workspaceId}/tasks/${notification.entityId}`);
    } else if (notification.entityType === "PROJECT") {
      router.push(`/workspaces/${notification.workspaceId}/projects/${notification.entityId}`);
    } else {
      router.push(`/workspaces/${notification.workspaceId}`);
    }

    setIsOpen(false);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (unreadCount > 0) {
        markAsRead({ markAll: true });
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "ASSIGNED": return <UserPlus className="size-3 text-blue-500" />;
      case "UPDATED": return <Edit3 className="size-3 text-amber-500" />;
      case "COMMENTED": return <MessageSquare className="size-3 text-emerald-500" />;
      case "CREATED": return <Bell className="size-3 text-purple-500" />;
      default: return <Info className="size-3 text-muted-foreground" />;
    }
  };

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
                  {unreadCount > 9 ? "9+" : unreadCount}
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

      <DropdownMenuContent className="w-[340px]" align="start" side="right" sideOffset={8}>
        <DropdownMenuLabel className="flex items-center justify-between py-3 font-normal">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span
              onClick={handleMarkAllRead}
              role="button"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors"
            >
              <CheckCircle2 className="size-3" />
              Mark all read
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex h-16 items-center justify-center">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="flex flex-col h-24 items-center justify-center text-muted-foreground">
              <Bell className="size-6 mb-2 opacity-20" />
              <p className="text-xs italic">No new notifications</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-1">
              {notifications.map((item: NotificationItem) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    "cursor-pointer flex items-start gap-3 p-3 transition-colors focus:bg-accent rounded-md",
                    !item.isRead && "bg-muted/40 border-l-2 border-primary"
                  )}
                >
                  <div className="relative mt-0.5 shrink-0">
                    <Avatar className="size-8 border">
                      <AvatarImage src={item.actor?.image || ""} />
                      <AvatarFallback className="text-[10px] uppercase">
                        {item.actor?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm border">
                      {getActionIcon(item.action)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 w-full overflow-hidden">
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className={cn(
                          "text-sm font-semibold leading-tight line-clamp-1",
                          !item.isRead ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {item.title}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                        <Clock className="size-2.5" />
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-snug">
                      <span className="font-medium text-foreground/80">{item.actor?.name}</span>{" "}
                      {item.message}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};