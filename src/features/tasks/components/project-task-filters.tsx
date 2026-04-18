"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation"; 
import { Layers, ListCheckIcon, UserIcon, X, SearchIcon } from "lucide-react";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useTaskFilters } from "../hooks/use-task-filters";
import { useGetProjectMembers } from "@/features/members/api/use-get-project-members";
import { useGetSegments } from "@/features/segments/api/use-get-segments";
import { useGetProjectColumns } from "@/features/projects/api/use-get-project-columns";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const ProjectTaskFilters = () => {
    const workspaceId = useWorkspaceId();
    const projectId = useProjectId(); 
    
    const params = useParams();
    const paramSegmentId = params.segmentId as string | undefined;

    const [filters, setFilters] = useTaskFilters();
    const { status, assigneeId, segmentId, dueDate, search } = filters;

    // Queries
    const { data: projectMembersData, isLoading: isLoadingMembers } = useGetProjectMembers(projectId);
    const { data: segmentsData, isLoading: isLoadingSegments } = useGetSegments(projectId);
    const { data: columnsData, isLoading: isLoadingColumns } = useGetProjectColumns(projectId);

    const isLoading = isLoadingMembers || isLoadingSegments || isLoadingColumns;

    const extractArray = (data: any): any[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (data.data && Array.isArray(data.data)) return data.data;
        if (data.documents && Array.isArray(data.documents)) return data.documents;
        return [];
    };

    const memberOptions = useMemo(() => extractArray(projectMembersData).map(m => ({ value: m.userId || m.id, label: m.name || m.user?.name || "Member" })), [projectMembersData]);
    const segmentOptions = useMemo(() => extractArray(segmentsData).map(s => ({ value: s.id, label: s.name })), [segmentsData]);
    const statusOptions = useMemo(() => extractArray(columnsData).map(c => ({ value: c.id, label: c.name })), [columnsData]);

    if (isLoading) return null;

    const isAnyFilterActive = 
    (status && status !== "all") || 
    (assigneeId && assigneeId !== "all-tasks") || 
    (segmentId && segmentId !== "all") || 
    !!dueDate || 
    !!search;

    const resetFilters = () => {
        setFilters({ status: null, assigneeId: null, segmentId: null, dueDate: null, search: null });
    };

    const activeSegmentValue = segmentId || paramSegmentId || "all";

    return (
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center flex-wrap">
            <div className="relative w-full lg:w-48">
                <SearchIcon className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tasks..." value={search || ""} onChange={(e) => setFilters({ search: e.target.value || null })} className="h-8 pl-8 w-full" />
            </div>

            <Select value={status || "all"} onValueChange={(val) => setFilters({ status: val === "all" ? null : val })}>
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2"><ListCheckIcon className="size-4 mr-2" /><SelectValue placeholder="All Statuses" /></div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectSeparator />
                    {statusOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                </SelectContent>
            </Select>

            <Select value={assigneeId || "all-tasks"} onValueChange={(val) => setFilters({ assigneeId: val === "all-tasks" ? null : val })}>
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2"><UserIcon className="size-4 mr-2" /><SelectValue placeholder="All Assignees" /></div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all-tasks">All Assignees</SelectItem>
                    <SelectItem value="no-assignee">No Assignee</SelectItem>
                    <SelectSeparator />
                    {memberOptions.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                </SelectContent>
            </Select>

            <Select value={activeSegmentValue} onValueChange={(val) => setFilters({ segmentId: val })}>
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2"><Layers className="size-4 mr-2" /><SelectValue placeholder="All Segments" /></div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Segments</SelectItem>
                    <SelectItem value="no-segment">No Segment</SelectItem>
                    <SelectSeparator />
                    {segmentOptions.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                </SelectContent>
            </Select>

            <DatePicker 
                placeholder="Due date" 
                className="h-8 w-full lg:w-auto" 
                value={dueDate ? new Date(dueDate) : undefined} 
                onChange={(d) => setFilters({ dueDate: d ? d.toISOString() : null })} 
            />

            {isAnyFilterActive && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-muted-foreground hover:text-foreground">
                    <X className="size-4 mr-2" /> Reset
                </Button>
            )}
        </div>
    );
};