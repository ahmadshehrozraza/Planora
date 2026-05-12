import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

export const useCreateRiskModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-risk",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );
  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false), setIsOpen };
};

export const useEditRiskModal = () => {
  const [riskId, setRiskId] = useQueryState(
    "edit-risk",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true })
  );
  return { riskId, open: (id: string) => setRiskId(id), close: () => setRiskId(""), setRiskId };
};