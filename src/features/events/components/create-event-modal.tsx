"use client";

import { ResponsiveModal } from "@/components/responsive-model";

import { useCreateEventModal } from "../hooks/use-create-event-modal";
import { CreateEventWrapper } from "./create-event-wrapper";

export const CreateEventModal =() => {
    const { isOpen, setIsOpen, close } = useCreateEventModal();


    return (
        <ResponsiveModal open={isOpen} onOpenChange={setIsOpen} >
            <CreateEventWrapper onCancel={close} />
        </ResponsiveModal>
    )
}