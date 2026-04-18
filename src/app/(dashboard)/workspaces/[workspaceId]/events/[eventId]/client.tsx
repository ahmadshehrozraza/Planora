"use client";

import { EditEventWrapper } from "@/features/events/components/edit-event-wrapper";
import { useEventId } from "@/features/events/hooks/use-event-id";

export const EventClient = ()=> {

    const eventId = useEventId();
    
    return(
        <EditEventWrapper eventId={eventId} />
    )
};

export default EventClient;