import { useQueryState, parseAsBoolean } from "nuqs";

export const useEditEventModal = () => {
    const [isOpen, setIsOpen] = useQueryState(
        "edit-event",
        parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
    );

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return {
        isOpen,
        open,
        close,
        setIsOpen,
    };
};