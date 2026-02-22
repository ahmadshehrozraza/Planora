import { parseAsString, useQueryStates } from "nuqs";
import { TaskStatus } from "../types";

export const useTaskFilters = () => {
    return useQueryStates({
        projectId: parseAsString.withDefault("all"),
        segmentId: parseAsString.withDefault("all"),
        status: parseAsString.withDefault("all"),
        assigneeId: parseAsString.withDefault("all-tasks"),
        search: parseAsString.withDefault(""),
        dueDate: parseAsString.withDefault(""),
    });
}