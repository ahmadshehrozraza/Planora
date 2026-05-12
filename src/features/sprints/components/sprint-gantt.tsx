"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Task as GanttTaskType, ViewMode } from "gantt-task-react";
import { format, differenceInDays } from "date-fns";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize, Grid3X3, Columns } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useUpdateSprint } from "@/features/sprints/api/use-update-sprint";
import { SprintStatus } from "@/features/sprints/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

import "gantt-task-react/dist/index.css";
import "@/components/ui/gantt.css";

const Gantt = dynamic(() => import("gantt-task-react").then((mod) => mod.Gantt), { ssr: false });

interface SprintGanttProps {
    sprints: any[];
    events?: any[];
}

interface ExtendedGanttSprint extends GanttTaskType {
    originalId: string;
    workspaceId: string;
    projectId: string;
    indexNum?: number;
    status?: string;
    capacity?: number;
    goal?: string;
}

const SPRINT_COLORS = [
    { bg: "#3b82f6", progress: "#1d4ed8" }, 
    { bg: "#10b981", progress: "#047857" }, 
    { bg: "#8b5cf6", progress: "#6d28d9" }, 
    { bg: "#f59e0b", progress: "#b45309" }, 
    { bg: "#ec4899", progress: "#be185d" }, 
    { bg: "#14b8a6", progress: "#0f766e" }, 
];

const CustomTooltip = ({ task }: { task: GanttTaskType }) => {
    const sprint = task as ExtendedGanttSprint;

    if (task.type === "milestone") {
        return (
            <div className="bg-background border border-amber-500/30 shadow-md rounded-md p-3 text-sm z-50 min-w-[200px]">
                <p className="font-bold text-amber-600 dark:text-amber-500 mb-1 flex items-center gap-2">
                    ♦ Event / Milestone
                </p>
                <p className="font-semibold text-foreground mb-1">{task.name}</p>
                <p className="text-muted-foreground text-xs">
                    {format(task.start, "dd MMM yyyy")}
                </p>
            </div>
        );
    }

    const duration = differenceInDays(task.end, task.start);
    return (
        <div className="bg-background border border-border shadow-md rounded-md p-3 text-sm z-50 min-w-[240px]">
            <p className="font-semibold text-foreground mb-1">{sprint.name}</p>
            {sprint.goal && (
                <p className="text-muted-foreground text-xs italic mb-2 line-clamp-2">"{sprint.goal}"</p>
            )}
            <p className="text-muted-foreground text-xs mb-3 font-medium">
                {format(task.start, "dd MMM yyyy")} - {format(task.end, "dd MMM yyyy")}
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-foreground">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium capitalize px-1.5 py-0.5 rounded-sm bg-muted">{sprint.status?.toLowerCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{duration || 1} day(s)</span>
                </div>
                {sprint.capacity && (
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">{sprint.capacity} pts</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export const SprintGantt = ({ sprints, events = [] }: SprintGanttProps) => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const projectId = useProjectId();
    const { mutate: updateSprint } = useUpdateSprint();

    const [view, setView] = useState<ViewMode>(ViewMode.Week);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [showGridLines, setShowGridLines] = useState(false);
    
    const [showName, setShowName] = useState(true);
    const [showStatus, setShowStatus] = useState(true);
    const [showCapacity, setShowCapacity] = useState(true);
    const [showDates, setShowDates] = useState(true);

    const ganttWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (!isFullscreen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    };

    const formattedSprints: ExtendedGanttSprint[] = useMemo(() => {
        let sprintCounter = 1;
        
        const parsedSprints = sprints.map((sprint, index) => {
            const start = sprint.startDate ? new Date(sprint.startDate) : new Date();
            const end = sprint.dueDate ? new Date(sprint.dueDate) : new Date(new Date().setDate(new Date().getDate() + 14)); 
            
            const themeColor = SPRINT_COLORS[index % SPRINT_COLORS.length];

            const isClosed = sprint.status === SprintStatus.CLOSED;

            return {
                start,
                end,
                name: sprint.name,
                id: sprint.id,
                originalId: sprint.id,
                workspaceId: workspaceId,
                projectId: sprint.projectId || projectId,
                indexNum: sprint.sprintNumber || sprintCounter++,
                status: sprint.status,
                capacity: sprint.capacityPoints,
                goal: sprint.goal,
                type: "task" as const,
                progress: isClosed ? 100 : 0, 
                dependencies: [], 
                isDisabled: sprint.status !== SprintStatus.PLANNED, 
                styles: {
                    backgroundColor: isClosed ? "#64748b" : themeColor.bg,
                    backgroundSelectedColor: isClosed ? "#475569" : themeColor.progress,
                    progressColor: isClosed ? "#475569" : themeColor.progress, 
                    progressSelectedColor: isClosed ? "#475569" : themeColor.progress,
                },
            };
        });

        let eventCounter = 1;
        const parsedEvents = events.map((event) => {
            const eventDate = new Date(event.date);
            const stringId = typeof event.id === "string" ? event.id : `fallback_${eventCounter++}`;
            
            return {
                start: eventDate,
                end: eventDate,
                name: event.title || event.name || "Untitled Event",
                id: `event_${stringId}`,
                originalId: stringId,
                workspaceId: event.workspaceId || workspaceId,
                projectId: event.projectId || projectId,
                type: "milestone" as const,
                progress: 100,
                dependencies: [],
                isDisabled: true, 
                styles: {
                    backgroundColor: "#eab308", 
                    progressColor: "#eab308",
                    backgroundSelectedColor: "#ca8a04",
                    progressSelectedColor: "#ca8a04",
                }
            };
        });

        return [...parsedEvents, ...parsedSprints];
    }, [sprints, events, workspaceId, projectId]);

    const uniqueMonths = useMemo(() => {
        if (formattedSprints.length === 0) return [];
        const months = new Set<string>();
        formattedSprints.forEach(sprint => {
            months.add(format(sprint.start, "yyyy-MM"));
            months.add(format(sprint.end, "yyyy-MM"));
        });
        return Array.from(months).sort();
    }, [formattedSprints]);

    useEffect(() => {
        if (selectedMonth && ganttWrapperRef.current) {
            const [year, month] = selectedMonth.split('-');
            const targetDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            
            if(formattedSprints.length > 0) {
               const minDate = new Date(Math.min(...formattedSprints.map(t => t.start.getTime())));
               const daysDiff = differenceInDays(targetDate, minDate);
               
               let colWidth = 60;
               if (view === ViewMode.Month) colWidth = 150;
               if (view === ViewMode.Week) colWidth = 100;
               if (view === ViewMode.Year) colWidth = 350;
               
               const scrollContainer = ganttWrapperRef.current.querySelector('.gantt-scroll-x');
               if(scrollContainer) {
                   const multiplier = view === ViewMode.Day ? 1 : view === ViewMode.Week ? 1/7 : view === ViewMode.Month ? 1/30 : 1/365;
                   scrollContainer.scrollLeft = Math.max(0, daysDiff * colWidth * multiplier);
               }
            }
        }
    }, [selectedMonth, view, formattedSprints]);

    const handleSprintChange = (ganttSprint: GanttTaskType) => {
        if (ganttSprint.type === "milestone") return; 

        const extendedSprint = ganttSprint as ExtendedGanttSprint;

        updateSprint({
            sprintId: extendedSprint.originalId,
            projectId: extendedSprint.projectId,
            values: {
                startDate: ganttSprint.start.toISOString(),
                dueDate: ganttSprint.end.toISOString(),
            }
        });
    };

    const handleSprintClick = (ganttSprint: GanttTaskType) => {
        const extendedSprint = ganttSprint as ExtendedGanttSprint;
        
        if (ganttSprint.type === "milestone") {
            if (!extendedSprint.workspaceId || !extendedSprint.originalId) return;
            router.push(`/workspaces/${extendedSprint.workspaceId}/events/${extendedSprint.originalId}`);
            return;
        } 
        
        if (!extendedSprint.workspaceId || !extendedSprint.projectId || !extendedSprint.originalId) return;
        router.push(`/workspaces/${extendedSprint.workspaceId}/projects/${extendedSprint.projectId}/sprints/${extendedSprint.originalId}`);
    };

    if (formattedSprints.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] border rounded-lg bg-muted/10 text-muted-foreground p-6 text-center">
                <p className="font-semibold text-lg">No Sprints found for this filter.</p>
                <p className="text-sm mt-2">Adjust your filters or assign Start/Due dates to your sprints to see them on the timeline.</p>
            </div>
        );
    }

    let columnWidth = 60;
    if (view === ViewMode.Month) columnWidth = 150;
    if (view === ViewMode.Week) columnWidth = 100;
    if (view === ViewMode.Year) columnWidth = 300;

    const dynamicListCellWidth = `${40 + (showName ? 180 : 0) + (showStatus ? 90 : 0) + (showCapacity ? 70 : 0) + (showDates ? 130 : 0)}px`; 

    const CustomTaskListHeader = ({ headerHeight }: { headerHeight: number }) => {
        return (
            <div className="flex items-center border-b border-border bg-muted/40 text-foreground font-semibold text-[11px] uppercase tracking-wider px-3" style={{ height: headerHeight }}>
                <div className="w-[40px]">SP #</div>
                {showName && <div className="w-[180px] pr-4">Sprint Name</div>}
                {showStatus && <div className="w-[90px] truncate">Status</div>}
                {showCapacity && <div className="w-[70px] truncate">Points</div>}
                {showDates && (
                    <>
                        <div className="w-[65px]">Start</div>
                        <div className="w-[65px]">Due</div>
                    </>
                )}
            </div>
        );
    };

    const CustomTaskListTable = ({ rowHeight, tasks }: { rowHeight: number; tasks: GanttTaskType[] }) => {
        return (
            <div className="flex flex-col bg-background">
                {tasks.map((t) => {
                    const sprint = t as ExtendedGanttSprint;
                    return (
                        <div
                            key={sprint.id}
                            className={`flex items-center border-b border-border text-xs px-3 hover:bg-muted/30 transition-colors cursor-pointer ${sprint.type === 'milestone' ? 'text-amber-600 dark:text-amber-500 font-semibold bg-amber-500/5' : 'text-foreground'}`}
                            style={{ height: rowHeight }}
                        >
                            <div className="w-[40px] font-mono text-muted-foreground font-medium">{sprint.type === 'milestone' ? "♦" : `SP-${sprint.indexNum}`}</div>
                            {showName && <div className="w-[180px] pr-4 truncate font-medium" title={sprint.name}>{sprint.name}</div>}
                            {showStatus && (
                                <div className="w-[90px] truncate">
                                    {sprint.type === 'milestone' ? "-" : (
                                        <span className="capitalize px-1.5 py-0.5 rounded-sm bg-muted text-[10px] font-medium border">
                                            {sprint.status?.toLowerCase()}
                                        </span>
                                    )}
                                </div>
                            )}
                            {showCapacity && (
                                <div className="w-[70px] truncate text-muted-foreground font-mono">
                                    {sprint.type === 'milestone' ? "-" : (sprint.capacity ? sprint.capacity : "0")}
                                </div>
                            )}
                            {showDates && (
                                <>
                                    <div className="w-[65px] text-muted-foreground">{format(sprint.start, "dd/MM/yy")}</div>
                                    <div className="w-[65px] text-muted-foreground">{sprint.type === 'milestone' ? "-" : format(sprint.end, "dd/MM/yy")}</div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div 
            className={`w-full flex flex-col transition-all gantt-theme-override ${isDark ? "dark-gantt" : ""} ${!showGridLines ? "hide-grid-lines" : ""} ${isFullscreen ? "fixed inset-0 z-[99999] bg-background p-6 w-screen h-screen overflow-hidden" : "border rounded-lg bg-background p-4 shadow-sm relative"}`}
        >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 border-r border-border pr-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    <Columns className="mr-2 h-3.5 w-3.5" /> Columns
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="z-[999999]">
                                <DropdownMenuCheckboxItem checked={showName} onCheckedChange={setShowName}>Sprint Name</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={showStatus} onCheckedChange={setShowStatus}>Status</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={showCapacity} onCheckedChange={setShowCapacity}>Capacity Points</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={showDates} onCheckedChange={setShowDates}>Dates (Start/Due)</DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-md border overflow-x-auto">
                        <Button variant={view === ViewMode.Day ? "secondary" : "ghost"} size="sm" onClick={() => setView(ViewMode.Day)} className="h-7 text-xs">Day</Button>
                        <Button variant={view === ViewMode.Week ? "secondary" : "ghost"} size="sm" onClick={() => setView(ViewMode.Week)} className="h-7 text-xs">Week</Button>
                        <Button variant={view === ViewMode.Month ? "secondary" : "ghost"} size="sm" onClick={() => setView(ViewMode.Month)} className="h-7 text-xs">Month</Button>
                        <Button variant={view === ViewMode.Year ? "secondary" : "ghost"} size="sm" onClick={() => setView(ViewMode.Year)} className="h-7 text-xs">Year</Button>
                    </div>

                    {uniqueMonths.length > 0 && (
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="h-8 w-[150px]"><SelectValue placeholder="Jump to month" /></SelectTrigger>
                            <SelectContent className="z-[999999]">
                                {uniqueMonths.map(monthStr => {
                                    const [year, month] = monthStr.split('-');
                                    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                                    return (<SelectItem key={monthStr} value={monthStr}>{format(date, "MMMM yyyy")}</SelectItem>);
                                })}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant={showGridLines ? "secondary" : "outline"} size="sm" onClick={() => setShowGridLines(!showGridLines)} className="h-8" title="Toggle Vertical Lines"><Grid3X3 className="size-3.5" /></Button>
                    <Button variant="outline" size="sm" onClick={toggleFullscreen} className="h-8 shrink-0">
                        {isFullscreen ? <><Minimize className="size-3.5 mr-2" /> Exit Fullscreen</> : <><Maximize className="size-3.5 mr-2" /> Fullscreen</>}
                    </Button>
                </div>
            </div>

            <div ref={ganttWrapperRef} className="flex-1 overflow-x-auto border border-border rounded-md transition-all">
                <Gantt
                    tasks={formattedSprints}
                    viewMode={view}
                    listCellWidth={dynamicListCellWidth} 
                    columnWidth={columnWidth}
                    headerHeight={50}
                    rowHeight={45}
                    barCornerRadius={6}
                    todayColor={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(37, 99, 235, 0.05)"}
                    TooltipContent={CustomTooltip} 
                    arrowColor={isDark ? "#475569" : "#94a3b8"} 
                    TaskListHeader={CustomTaskListHeader}
                    TaskListTable={CustomTaskListTable}
                    onClick={handleSprintClick}
                    onDateChange={handleSprintChange}
                />
            </div>
        </div>
    );
};