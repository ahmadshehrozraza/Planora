import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/date-picker";
import { FolderIcon, ListCheckIcon, UserIcon, X } from "lucide-react";
import { SelectSeparator } from "@radix-ui/react-select";
import { TaskStatus } from "../types";
import { useTaskFilters } from "../hooks/use-task-filters";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useCurrent } from "@/features/auth/api/use-current"; 
import { useGetMember } from "@/features/members/api/use-get-member";

interface DataFiltersProps {
    hideProjectFilter?: boolean;
}

export const DataFilters = ({
    hideProjectFilter,
}: DataFiltersProps) => {
    const workspaceId = useWorkspaceId();

    if (!workspaceId) {
        console.log("workspace id is null in data filters");
        return null;
    }

    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
    const { data: currentUser } = useCurrent(); 
    const { data: currentMember } = useGetMember({ 
        workspaceId, 
        userId: currentUser?.$id 
    }); 

    const isLoading = isLoadingProjects || isLoadingMembers;

    const projectOptions = projects?.documents.map((project) => ({
        value: project.$id,
        label: project.name,
    }));

    const memberOptions = members?.documents.map((member) => ({
        value: member.$id,
        label: member.name,
    }));

    const [filters, setFilters] = useTaskFilters();

    const {
        status,
        assigneeId,
        projectId,
        dueDate,
        search,
    } = filters;

    const isAdmin = currentMember?.role === "ADMIN";
    
    const isAnyFilterActive = useMemo(() => {
        const filtersToCheck = [status, projectId, dueDate, search];
        if (isAdmin) {
            filtersToCheck.push(assigneeId); // Include assignee filter for admin
        }
        return filtersToCheck.some(filter => !!filter);
    }, [status, assigneeId, projectId, dueDate, search, isAdmin]);

    const onStatusChange = (value: string) => {
        if (value === "all") {
            setFilters({ status: null });
        } else {
            setFilters({ status: value as TaskStatus });
        }
    }

    const onAssigneeChange = (value: string) => {
        if (value === "all-tasks") {
            setFilters({ assigneeId: null });
        }
        else if (value === "no-assignee") {
            setFilters({ assigneeId: "no-assignee" });
        }
        else {
            setFilters({ assigneeId: value });
        }
    };

    const onProjectChange = (value: string) => {
        setFilters({ projectId: value === "all" ? null : value });
    }

    const resetAllFilters = () => {
        const resetFilters: any = {
            status: null,
            projectId: null,
            dueDate: null,
            search: null,
        };
        
        if (isAdmin) {
            resetFilters.assigneeId = null;
        }
        
        setFilters(resetFilters);
    }

    const getStatusPlaceholder = () => {
        if (!status) return "All Statuses";
        return Object.values(TaskStatus).find(s => s === status) || "All Statuses";
    }

    const getAssigneePlaceholder = () => {
        if (!assigneeId) return "All Assignees";
        if (assigneeId === "no-assignee") return "No Assignee";
        return memberOptions?.find(m => m.value === assigneeId)?.label || "All Assignees";
    }

    const getProjectPlaceholder = () => {
        if (!projectId) return "All Projects";
        return projectOptions?.find(p => p.value === projectId)?.label || "All Projects";
    }

    if (isLoading) return null;

    return (
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center">
            <Select
                value={status || "all"}
                onValueChange={onStatusChange}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <ListCheckIcon className="size-4 mr-2" />
                        <SelectValue placeholder="All statuses">
                            {getStatusPlaceholder()}
                        </SelectValue>
                    </div>
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectSeparator />
                    <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                    <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                    <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                </SelectContent>
            </Select>

            {isAdmin && (
                <Select
                    value={assigneeId}
                    onValueChange={onAssigneeChange}
                >
                    <SelectTrigger className="w-full lg:w-auto h-8">
                        <div className="flex items-center pr-2">
                            <UserIcon className="size-4 mr-2" />
                            <SelectValue placeholder="All Assignees">
                                {getAssigneePlaceholder()}
                            </SelectValue>
                        </div>
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="all-tasks">All Assignee</SelectItem>
                        <SelectItem value="no-assignee">No Assignee</SelectItem>
                        <SelectSeparator />
                        {memberOptions?.map((member) => (
                            <SelectItem key={member.value} value={member.value}>
                                {member.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {!hideProjectFilter && (
                <Select
                    value={projectId || "all"}
                    onValueChange={onProjectChange}
                >
                    <SelectTrigger className="w-full lg:w-auto h-8">
                        <div className="flex items-center pr-2">
                            <FolderIcon className="size-4 mr-2" />
                            <SelectValue placeholder="All projects">
                                {getProjectPlaceholder()}
                            </SelectValue>
                        </div>
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="all">All projects</SelectItem>
                        <SelectSeparator />
                        {projectOptions?.map((project) => (
                            <SelectItem key={project.value} value={project.value}>
                                {project.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Due Date Filter - Always visible */}
            <DatePicker
                placeholder="Due date"
                className="h-8 w-full lg:w-auto"
                value={dueDate ? new Date(dueDate) : undefined}
                onChange={(date) => {
                    if (date) {
                        const isoString = date.toISOString();
                        setFilters({ dueDate: isoString });
                    } else {
                        setFilters({ dueDate: null });
                    }
                }}
            />

            {/* Reset Button */}
            {isAnyFilterActive && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={resetAllFilters}
                    className="h-8 w-full lg:w-auto"
                >
                    <X className="size-4 mr-2" />
                    Reset Filters
                </Button>
            )}
        </div>
    );
};