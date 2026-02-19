import { useQueryStates, parseAsString, parseAsIsoDateTime } from "nuqs";

export const useEventFilters = () => {
  return useQueryStates({
    projectId: parseAsString,
    segmentId: parseAsString,
    date: parseAsIsoDateTime, 
  });
};