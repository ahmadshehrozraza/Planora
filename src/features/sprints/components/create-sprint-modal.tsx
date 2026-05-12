"use client";

import { ResponsiveModal } from "@/components/responsive-model";
import { CreateSprintForm } from "./create-sprint-form";
import { useCreateSprintModal } from "../hooks/use-create-sprint-modal";

export const CreateSprintModal = () => {
    const { isOpen, setIsOpen, close, projectId } = useCreateSprintModal();

    return (
        <ResponsiveModal open={isOpen} onOpenChange={setIsOpen} size="xl">
            <CreateSprintForm onCancel={close} projectId={projectId} />
        </ResponsiveModal>
    )
}