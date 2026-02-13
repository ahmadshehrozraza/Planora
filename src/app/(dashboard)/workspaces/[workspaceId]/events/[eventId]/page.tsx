"use client";

import { EditEventForm } from "@/features/events/components/edit-event-form";
import { useEventId } from "@/features/events/hooks/use-event-id"

export default function event() {

    const eventId = useEventId();

    const event = {
        $id: eventId,
        title: "Sprint Planning - Q1",
        date: new Date().toISOString(),
        description: "Discussing the roadmap for the first quarter including major feature releases.",
        workspaceId: "ws_1", // Make sure IDs match your dropdown options
        projectId: "pj_1",
        segmentId: "sg_1",
    };
    
  return (
    <div className="w-full">
        <EditEventForm initialValues={event} />
    </div>
  )
};