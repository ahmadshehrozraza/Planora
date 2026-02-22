"use client";

import { useMemo } from "react";
import { FolderIcon, Layers, ListCheckIcon, UserIcon, X } from "lucide-react";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useTaskFilters } from "../hooks/use-task-filters";
import { useGetWorkspaceMembers } from "@/features/members/api/use-get-dummy-members";
import { useGetDummyProjects } from "@/features/projects/api/use-get-dummy-projects";
import { useGetDummySegmentsByProject } from "@/features/segments/api/use-get-dummy-segments";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { TaskStatus } from "../types";

interface DataFiltersProps {
    hideProjectFilter?: boolean;
}

export const DataFilters = ({ hideProjectFilter }: DataFiltersProps) => {
    const workspaceId = useWorkspaceId();
    const urlProjectId = useProjectId();
    
    const isProjectContext = !!urlProjectId;
    
    const [filters, setFilters] = useTaskFilters();
    const { status, assigneeId, projectId: filterProjectId, segmentId: filterSegmentId, dueDate, search } = filters;

    const effectiveProjectId = isProjectContext ? urlProjectId : filterProjectId;

    const { data: projects, isLoading: isLoadingProjects } = useGetDummyProjects(workspaceId);
    const { data: members, isLoading: isLoadingMembers } = useGetWorkspaceMembers(workspaceId);
    const { data: segments, isLoading: isLoadingSegments } = useGetDummySegmentsByProject(effectiveProjectId || undefined);

    const isLoading = isLoadingProjects || isLoadingMembers || (!!effectiveProjectId && isLoadingSegments);

    const projectOptions = useMemo(() => projects?.documents?.map((p) => ({ value: p.id, label: p.name })) || [], [projects]);
    const memberOptions = useMemo(() => members?.documents?.map((m) => ({ value: m.id, label: m.memberId })) || [], [members]);
    const segmentOptions = useMemo(() => segments?.documents?.map((s) => ({ value: s.id, label: s.name })) || [], [segments]);

    const currentProject = useMemo(() => projects?.documents?.find((p) => p.id === urlProjectId), [projects, urlProjectId]);

    const shouldShowProjectFilter = !hideProjectFilter && !isProjectContext;
    const shouldShowSegmentFilter = isProjectContext || !!filterProjectId;

    const onStatusChange = (value: string) => setFilters({ status: value === "all" ? null : value as TaskStatus });
    const onAssigneeChange = (value: string) => setFilters({ assigneeId: value === "all-tasks" ? null : value });
    const onProjectChange = (value: string) => setFilters({ projectId: value === "all" ? null : value, segmentId: null });
    const onSegmentChange = (value: string) => setFilters({ segmentId: value === "all" ? null : value });

    const resetAllFilters = () => {
        setFilters({
            status: null,
            assigneeId: null,
            projectId: isProjectContext ? urlProjectId : null,
            segmentId: null,
            dueDate: null,
            search: null,
        });
    };

    const isAnyFilterActive = useMemo(() => {
        return !!status || !!assigneeId || !!filterProjectId || !!filterSegmentId || !!dueDate || !!search;
    }, [status, assigneeId, filterProjectId, filterSegmentId, dueDate, search]);

    const getProjectPlaceholder = () => {
        if (isProjectContext && currentProject) return currentProject.name;
        if (!filterProjectId) return "All Projects";
        return projectOptions.find(p => p.value === filterProjectId)?.label || "All Projects";
    };

    const getSegmentPlaceholder = () => {
        if (!filterSegmentId) return "All Segments";
        return segmentOptions.find(s => s.value === filterSegmentId)?.label || "All Segments";
    };

    if (isLoading) return null;

    return (
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center">
            <Select value={status || "all"} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <ListCheckIcon className="size-4 mr-2" />
                        <SelectValue placeholder="All Statuses" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectSeparator />
                    <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                    <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                    <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                </SelectContent>
            </Select>

            <Select value={assigneeId || "all-tasks"} onValueChange={onAssigneeChange}>
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <UserIcon className="size-4 mr-2" />
                        <SelectValue placeholder="All Assignees" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all-tasks">All Assignees</SelectItem>
                    <SelectItem value="no-assignee">No Assignee</SelectItem>
                    <SelectSeparator />
                    {memberOptions.map((member) => (
                        <SelectItem key={member.value} value={member.value}>
                            {member.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {shouldShowProjectFilter && (
                <Select value={filterProjectId || "all"} onValueChange={onProjectChange}>
                    <SelectTrigger className="w-full lg:w-auto h-8">
                        <div className="flex items-center pr-2">
                            <FolderIcon className="size-4 mr-2" />
                            <SelectValue>
                                {getProjectPlaceholder()}
                            </SelectValue>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        <SelectSeparator />
                        {projectOptions.map((project) => (
                            <SelectItem key={project.value} value={project.value}>
                                {project.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {shouldShowSegmentFilter && (
                <Select value={filterSegmentId || "all"} onValueChange={onSegmentChange}>
                    <SelectTrigger className="w-full lg:w-auto h-8">
                        <div className="flex items-center pr-2">
                            <Layers className="size-4 mr-2" />
                            <SelectValue>
                                {getSegmentPlaceholder()}
                            </SelectValue>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Segments</SelectItem>
                        <SelectSeparator />
                        {segmentOptions.length > 0 ? (
                            segmentOptions.map((segment) => (
                                <SelectItem key={segment.value} value={segment.value}>
                                    {segment.label}
                                </SelectItem>
                            ))
                        ) : (
                            <div className="p-2 text-xs text-muted-foreground text-center">
                                No segments found
                            </div>
                        )}
                    </SelectContent>
                </Select>
            )}

            {isProjectContext && currentProject && (
                <div className="hidden lg:flex items-center px-3 py-1 bg-muted/50 rounded-md text-sm h-8 border border-border/50 text-muted-foreground">
                    <FolderIcon className="size-3.5 mr-2" />
                    <span className="truncate max-w-[150px]">{currentProject.name}</span>
                </div>
            )}

            <DatePicker
                placeholder="Due date"
                className="h-8 w-full lg:w-auto"
                value={dueDate ? new Date(dueDate) : undefined}
                onChange={(date) => {
                    setFilters({ dueDate: date ? date.toISOString() : null });
                }}
            />

            {isAnyFilterActive && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetAllFilters}
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                    <X className="size-4 mr-2" />
                    Reset
                </Button>
            )}
        </div>
    );
};