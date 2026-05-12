"use client";

import { format } from "date-fns";
import { Edit, MapPin, Clock, CalendarDays, FolderGit2, FileText, Paperclip, ExternalLink, Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useEditEventModal } from "../hooks/use-edit-event-modal";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { cn } from "@/lib/utils";

interface EventDetailsProps {
    event: any;
}

export const EventDetails = ({ event }: EventDetailsProps) => {
    const { open } = useEditEventModal();

    const { data: permissions } = useGetPermissions(event.workspaceId);
    const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];
    const allowed = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.EVENT_UPDATE);

    const renderLocation = (locationText: string) => {
        if (!locationText) return null;
        
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const hasUrl = urlRegex.test(locationText);

        if (hasUrl) {
            return (
                <a 
                    href={locationText.match(urlRegex)?.[0]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                >
                    {locationText}
                    <ExternalLink className="size-3" />
                </a>
            );
        }
        return <span className="text-foreground font-medium">{locationText}</span>;
    };

    const isInactive = event.status === "CANCELLED" || event.status === "MISSED";

    return (
        <div className="flex flex-col gap-6 pb-8 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "size-12 rounded-xl flex items-center justify-center border",
                        isInactive ? "bg-muted border-border" : "bg-primary/10 border-primary/20 text-primary"
                    )}>
                        <CalendarDays className="size-6" />
                    </div>
                    <div>
                        <h1 className={cn("text-2xl font-bold text-foreground", isInactive && "line-through opacity-70")}>
                            {event.title}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={event.status === "SCHEDULED" ? "outline" : "secondary"} className={cn(
                                "shadow-none uppercase tracking-wider text-[10px]",
                                event.status === "COMPLETED" && "bg-emerald-500/10 text-emerald-600 border-emerald-200",
                                event.status === "CANCELLED" && "bg-destructive/10 text-destructive border-destructive/20"
                            )}>
                                {event.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                Created by 
                                <MemberAvatar name={event.eventCreator?.name} src={event.eventCreator?.avatar} className="size-4" />
                                <span className="font-medium text-foreground">{event.eventCreator?.name}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {allowed && (
                    <Button onClick={open} variant="outline" className="shrink-0 bg-background shadow-sm">
                        <Edit className="size-4 mr-2" />
                        Edit Event
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-border bg-card">
                    <CardHeader className="py-4 border-b border-border/50 bg-muted/30">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="size-4 text-primary" />
                            Date & Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Start</span>
                            <span className="text-sm font-semibold text-foreground">
                                {event.date ? format(new Date(event.date), "PPP 'at' p") : "N/A"}
                            </span>
                        </div>
                        <Separator className="bg-border/50" />
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">End</span>
                            <span className="text-sm font-semibold text-foreground">
                                {event.endDate ? format(new Date(event.endDate), "PPP 'at' p") : "Not specified"}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border bg-card">
                    <CardHeader className="py-4 border-b border-border/50 bg-muted/30">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Info className="size-4 text-primary" />
                            Event Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="size-3.5" /> Location</span>
                            <div className="text-sm text-right">
                                {renderLocation(event.location) || <span className="text-muted-foreground italic">None</span>}
                            </div>
                        </div>
                        <Separator className="bg-border/50" />
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground flex items-center gap-1.5"><FolderGit2 className="size-3.5" /> Scope</span>
                            {event.project ? (
                                <div className="flex items-center gap-1.5">
                                    <ProjectAvatar name={event.project.name} image={event.project.imageUrl} className="size-5 border" fallbackClassName="text-[8px]" />
                                    <span className="text-sm font-medium">{event.project.name}</span>
                                    {event.sprint && <Badge variant="secondary" className="text-[10px] ml-1">{event.sprint.name}</Badge>}
                                </div>
                            ) : (
                                <span className="text-sm font-medium text-foreground">Workspace Level</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-border bg-card">
                <CardHeader className="py-4 border-b border-border/50 bg-muted/30">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        Description & Notes
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-5">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
                        {event.description ? (
                            <p className="text-sm text-foreground whitespace-pre-wrap">{event.description}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No description provided.</p>
                        )}
                    </div>
                    <Separator className="bg-border/50" />
                    <div className="p-5 bg-accent/20">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Agenda / Meeting Notes</h4>
                        {event.notes ? (
                            <p className="text-sm text-foreground whitespace-pre-wrap">{event.notes}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No notes available.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {event.attachments && event.attachments.length > 0 && (
                <Card className="shadow-sm border-border bg-card">
                    <CardHeader className="py-4 border-b border-border/50 bg-muted/30">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Paperclip className="size-4 text-primary" />
                            Attachments ({event.attachments.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {event.attachments.map((file: any) => (
                                <a 
                                    key={file.id} 
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted transition-colors group"
                                >
                                    <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <FileText className="size-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase">{file.type?.split('/')[1] || 'FILE'} • {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};