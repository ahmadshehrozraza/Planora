import { useQueryStates, parseAsString } from "nuqs";

export const useEventFilters = () => {
  return useQueryStates({
    projectId: parseAsString,
    date: parseAsString, 
  });
};