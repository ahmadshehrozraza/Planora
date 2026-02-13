"use client";

import { ResponsiveModal } from "@/components/responsive-model";

import { CreateSegmentForm } from "./create-segment-form";
import { useCreateSegmentModal } from "../hooks/use-create-segment-modal";

export const CreateSegmentModal =() => {
    const { isOpen, setIsOpen, close } = useCreateSegmentModal();


    return (
        <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}  size="xl">
            <CreateSegmentForm />
        </ResponsiveModal>
    )
}