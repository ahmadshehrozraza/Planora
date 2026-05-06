"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation"; 
import { Layers, ListCheckIcon, UserIcon, X, SearchIcon, TagIcon } from "lucide-react";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useTaskFilters } from "../hooks/use-task-filters";
import { useGetProjectMembers } from "@/features/members/api/use-get-project-members";
import { useGetSprints } from "@/features/sprints/api/use-get-sprints";
import { useGetProjectColumns } from "@/features/projects/api/use-get-project-columns";
import { useGetTags } from "@/features/tasks/api/use-task-tags";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const ProjectTaskFilters = () => {
    const workspaceId = useWorkspaceId();
    const projectId = useProjectId(); 
    
    const params = useParams();
    const paramSprintId = params.sprintId as string | undefined;

    const [filters, setFilters] = useTaskFilters();
    const { status, assigneeId, sprintId, dueDate, search, tagId } = filters;

    const { data: projectMembersData, isLoading: isLoadingMembers } = useGetProjectMembers(projectId);
    const { data: sprintsData, isLoading: isLoadingSprints } = useGetSprints(projectId);
    const { data: columnsData, isLoading: isLoadingColumns } = useGetProjectColumns(projectId);
    const { data: tagsData, isLoading: isLoadingTags } = useGetTags(projectId);

    const isLoading = isLoadingMembers || isLoadingSprints || isLoadingColumns || isLoadingTags;

    const extractArray = (data: any): any[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (data.data && Array.isArray(data.data)) return data.data;
        if (data.documents && Array.isArray(data.documents)) return data.documents;
        return [];
    };

    const memberOptions = useMemo(() => extractArray(projectMembersData).map(m => ({ value: m.userId || m.id, label: m.name || m.user?.name || "Member" })), [projectMembersData]);
    const sprintOptions = useMemo(() => extractArray(sprintsData).map(s => ({ value: s.id, label: s.name })), [sprintsData]);
    const statusOptions = useMemo(() => extractArray(columnsData).map(c => ({ value: c.id, label: c.name })), [columnsData]);
    const tagOptions = useMemo(() => extractArray(tagsData).map((t: any) => ({ value: t.id, label: t.name, color: t.color })), [tagsData]);

    if (isLoading) return null;

    const isAnyFilterActive = 
    (status && status !== "all") || 
    (assigneeId && assigneeId !== "all-tasks") || 
    (sprintId && sprintId !== "all") || 
    (tagId && tagId !== "all") ||
    !!dueDate || 
    !!search;

    const resetFilters = () => {
        setFilters({ status: null, assigneeId: null, sprintId: null, dueDate: null, search: null, tagId: null });
    };

    const activeSprintValue = sprintId || paramSprintId || "all";

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

            <Select value={activeSprintValue} onValueChange={(val) => setFilters({ sprintId: val })}>
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2"><Layers className="size-4 mr-2" /><SelectValue placeholder="All Sprints" /></div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Sprints</SelectItem>
                    <SelectItem value="no-sprint">No Sprint</SelectItem>
                    <SelectSeparator />
                    {sprintOptions.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                </SelectContent>
            </Select>

            <Select value={tagId || "all"} onValueChange={(val) => setFilters({ tagId: val === "all" ? null : val })}>
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2"><TagIcon className="size-4 mr-2" /><SelectValue placeholder="All Tags" /></div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    <SelectSeparator />
                    {tagOptions.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                            <div className="flex items-center gap-2">
                                <div className="size-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                                <span>{t.label}</span>
                            </div>
                        </SelectItem>
                    ))}
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