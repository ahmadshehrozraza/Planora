import { parseAsString, useQueryStates } from "nuqs";

export const useTaskFilters = () => {
    return useQueryStates({
        projectId: parseAsString, 
        sprintId: parseAsString, 
        status: parseAsString.withDefault("all"),
        assigneeId: parseAsString.withDefault("all-tasks"),
        search: parseAsString.withDefault(""),
        dueDate: parseAsString.withDefault(""),
        tagId: parseAsString.withDefault("all"),
    });
}