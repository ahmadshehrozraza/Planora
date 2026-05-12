"use client";

import { ResponsiveModal } from "@/components/responsive-model";
import { EditEventWrapper } from "./edit-event-wrapper";
import { useEditEventModal } from "../hooks/use-edit-event-modal";
import { useEventId } from "../hooks/use-event-id";

export const EditEventModal = () => {
    const { isOpen, setIsOpen, close } = useEditEventModal();
    const eventId = useEventId();

    return (
        <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
            {eventId ? (
                <EditEventWrapper eventId={eventId} onCancel={close} />
            ) : (
                <div className="p-4 text-center text-muted-foreground">No event ID found.</div>
            )}
        </ResponsiveModal>
    );
}