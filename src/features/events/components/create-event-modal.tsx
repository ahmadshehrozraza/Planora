"use client";

import { ResponsiveModal } from "@/components/responsive-model";

import { CreateEventForm } from "./create-event-form";
import { useCreateEventModal } from "../hooks/use-create-event-modal";

export const CreateEventModal =() => {
    const { isOpen, setIsOpen, close } = useCreateEventModal();


    return (
        <ResponsiveModal open={isOpen} onOpenChange={setIsOpen} >
            <CreateEventForm />
        </ResponsiveModal>
    )
}