"use client";

import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useEventId } from "@/features/events/hooks/use-event-id";
import { useGetEvent } from "@/features/events/api/use-get-event";
import { EventDetails } from "@/features/events/components/event-details";
import { EditEventModal } from "@/features/events/components/edit-event-modal";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { useEditEventModal } from "@/features/events/hooks/use-edit-event-modal";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DeleteEventCard } from "@/features/events/components/delete-event-card";

export const EventClient = () => {
    const eventId = useEventId();
    const { open } = useEditEventModal();
    
    const { data: event, isLoading, isError } = useGetEvent({ eventId });

    const workspaceId = useWorkspaceId();

    const { data: permissions } = useGetPermissions(workspaceId);
    const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];
    const allowed = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.EVENT_UPDATE);

    if (isLoading) return <PageLoader />;
    if (isError || !event) return <PageError message="Event not found or you don't have access." />;

    return (
        <div className="w-full  p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
            <EditEventModal />
            
            {/* Top Action Bar */}
            <div className="flex items-center justify-end w-full">
                {allowed && (
                    <Button 
                        onClick={open} 
                        variant="outline" 
                        className="shadow-sm bg-background hover:bg-accent transition-colors shrink-0"
                    >
                        <Edit className="size-4 mr-2" />
                        Edit Event
                    </Button>
                )}
            </div>

            <EventDetails event={event} />

            <DeleteEventCard eventId={event.id} workspaceId={workspaceId} />
        </div>
    );
};

export default EventClient;