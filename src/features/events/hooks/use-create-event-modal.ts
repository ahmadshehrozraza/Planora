import { useQueryState, parseAsBoolean } from "nuqs";

export const useCreateEventModal = () => {
    const [ isOpen, setIsOpen ] = useQueryState(
        "create-segment",
        parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true})
    )

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return {
        isOpen,
        open,
        close,
        setIsOpen,
    };
};