"use client";

import { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation"; 
import { FolderIcon, Layers, ListCheckIcon, UserIcon, X, SearchIcon } from "lucide-react";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useTaskFilters } from "../hooks/use-task-filters";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetWorkspaceMembers } from "@/features/workspaces/api/use-get-workspace-members";
import { useGetProjectMembers } from "@/features/members/api/use-get-project-members";
import { useGetSegments } from "@/features/segments/api/use-get-segments";
import { useGetProjectColumns } from "@/features/projects/api/use-get-project-columns";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const WorkspaceTaskFilters = () => {
    const workspaceId = useWorkspaceId();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [filters, setFilters] = useTaskFilters();
    const { status, assigneeId, projectId, segmentId, dueDate, search } = filters;
    const isProjectSelected = !!projectId && projectId !== "all";

    const { data: projectsData, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: workspaceMembersData, isLoading: isLoadingWorkspaceMembers } = useGetWorkspaceMembers( workspaceId );
    
    const { data: projectMembersData } = useGetProjectMembers(isProjectSelected ? projectId : undefined);
    const { data: segmentsData } = useGetSegments(isProjectSelected ? projectId : "all");
    const { data: columnsData } = useGetProjectColumns(isProjectSelected ? projectId : undefined);

    const isLoading = isLoadingProjects || isLoadingWorkspaceMembers;

    const extractArray = (data: any): any[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (data.data && Array.isArray(data.data)) return data.data;
        if (data.documents && Array.isArray(data.documents)) return data.documents;
        return [];
    };

    const projectOptions = useMemo(() => extractArray(projectsData).map((p: any) => ({ value: p.id, label: p.name })), [projectsData]);
    const segmentOptions = useMemo(() => extractArray(segmentsData).map((s: any) => ({ value: s.id, label: s.name })), [segmentsData]);
    const statusOptions = useMemo(() => extractArray(columnsData).map((c: any) => ({ value: c.id, label: c.name })), [columnsData]);

    const memberOptions = useMemo(() => {
        if (isProjectSelected) {
            return extractArray(projectMembersData).map((m: any) => ({ value: m.userId || m.id, label: m.name || m.user?.name || "Member" }));
        }
        return extractArray(workspaceMembersData).map((m: any) => ({ value: m.userId || m.id, label: m.name || m.user?.name || "Member" }));
    }, [isProjectSelected, projectMembersData, workspaceMembersData]);

    if (isLoading) return null;

    const isAnyFilterActive = 
        (projectId && projectId !== "all") ||
        (status && status !== "all") || 
        (assigneeId && assigneeId !== "all-tasks") || 
        (segmentId && segmentId !== "all") || 
        !!dueDate || 
        !!search;

    const resetFilters = () => {
        setFilters({ status: null, assigneeId: null, projectId: null, segmentId: null, dueDate: null, search: null });
    };

    const onProjectChange = (val: string) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (val === "all") {
            current.delete("projectId");
        } else {
            current.set("projectId", val);
        }

        current.delete("status");
        current.delete("segmentId");
        current.delete("assigneeId");

        const searchStr = current.toString();
        const query = searchStr ? `?${searchStr}` : "";

        router.push(`${pathname}${query}`);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center flex-wrap">
            <div className="relative w-full lg:w-48">
                <SearchIcon className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tasks..." value={search || ""} onChange={(e) => setFilters({ search: e.target.value || null })} className="h-8 pl-8 w-full" />
            </div>

            <Select value={projectId || "all"} onValueChange={onProjectChange}>
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <FolderIcon className="size-4 mr-2" />
                        <SelectValue placeholder="All Projects">
                            {projectId && projectId !== "all" ? projectOptions.find(p => p.value === projectId)?.label : "All Projects"}
                        </SelectValue>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectSeparator />
                    {projectOptions.map((p) => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}
                </SelectContent>
            </Select>

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

            <Select value={segmentId || "all"} onValueChange={(val) => setFilters({ segmentId: val === "all" ? null : val })}>
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

            <DatePicker placeholder="Due date" className="h-8 w-full lg:w-auto" value={dueDate ? new Date(dueDate) : undefined} onChange={(d) => setFilters({ dueDate: d ? d.toISOString() : null })} />

            {isAnyFilterActive && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-muted-foreground hover:text-foreground">
                    <X className="size-4 mr-2" /> Reset
                </Button>
            )}
        </div>
    );
};