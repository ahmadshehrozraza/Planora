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
import { useUpdateTask } from "@/features/tasks/api/use-update-task";

import "gantt-task-react/dist/index.css";
import "@/components/ui/gantt.css";

const Gantt = dynamic(() => import("gantt-task-react").then((mod) => mod.Gantt), { ssr: false });

interface DataGanttProps {
    tasks: any[];
    events?: any[];
}

interface ExtendedGanttTask extends GanttTaskType {
    originalId: string;
    workspaceId: string;
    indexNum?: number;
    sprintName?: string;
}

const TASK_COLORS = [
    { bg: "#3b82f6", progress: "#1d4ed8" }, 
    { bg: "#10b981", progress: "#047857" }, 
    { bg: "#8b5cf6", progress: "#6d28d9" }, 
    { bg: "#f59e0b", progress: "#b45309" }, 
    { bg: "#f43f5e", progress: "#be123c" }, 
];

const CustomTooltip = ({ task }: { task: GanttTaskType }) => {
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
        <div className="bg-background border border-border shadow-md rounded-md p-3 text-sm z-50 min-w-[200px]">
            <p className="font-semibold text-foreground mb-1">{task.name}</p>
            <p className="text-muted-foreground text-xs mb-2">
                {format(task.start, "dd MMM yyyy")} - {format(task.end, "dd MMM yyyy")}
            </p>
            <div className="flex flex-col gap-1 text-xs text-foreground">
                <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{duration || 1} day(s)</span>
                </div>
            </div>
        </div>
    );
};

export const DataGantt = ({ tasks, events = [] }: DataGanttProps) => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const router = useRouter();
    const { mutate: updateTask } = useUpdateTask();

    const [view, setView] = useState<ViewMode>(ViewMode.Week);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [showGridLines, setShowGridLines] = useState(false);
    
    const [showTaskName, setShowTaskName] = useState(true);
    const [showSprint, setShowSprint] = useState(true);
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

    const formattedTasks: ExtendedGanttTask[] = useMemo(() => {
        let taskCounter = 1;
        
        const parsedTasks = tasks.map((task, index) => {
            const start = task.startDate ? new Date(task.startDate) : new Date();
            const end = task.dueDate ? new Date(task.dueDate) : new Date(new Date().setDate(new Date().getDate() + 1));
            const themeColor = TASK_COLORS[index % TASK_COLORS.length];
            const taskDependencies = Array.isArray(task.blockedBy) ? task.blockedBy.map((d: any) => d.id) : [];

            return {
                start,
                end,
                name: task.name,
                id: task.id,
                originalId: task.id,
                workspaceId: task.workspaceId,
                indexNum: taskCounter++,
                sprintName: task.sprint?.name || "-",
                type: "task" as const,
                progress: task.column?.category === "DONE" ? 100 : (task.column?.category === "IN_PROGRESS" ? 50 : 0),
                dependencies: taskDependencies,
                isDisabled: false,
                styles: {
                    backgroundColor: themeColor.bg,
                    backgroundSelectedColor: themeColor.progress,
                    progressColor: themeColor.progress, 
                    progressSelectedColor: themeColor.progress,
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
                workspaceId: event.workspaceId || (tasks.length > 0 ? tasks[0].workspaceId : ""),
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

        return [...parsedEvents, ...parsedTasks];
    }, [tasks, events]);

    const uniqueMonths = useMemo(() => {
        if (formattedTasks.length === 0) return [];
        const months = new Set<string>();
        formattedTasks.forEach(task => {
            months.add(format(task.start, "yyyy-MM"));
            months.add(format(task.end, "yyyy-MM"));
        });
        return Array.from(months).sort();
    }, [formattedTasks]);

    useEffect(() => {
        if (selectedMonth && ganttWrapperRef.current) {
            const [year, month] = selectedMonth.split('-');
            const targetDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            
            if(formattedTasks.length > 0) {
               const minDate = new Date(Math.min(...formattedTasks.map(t => t.start.getTime())));
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
    }, [selectedMonth, view, formattedTasks]);

    const handleTaskChange = (ganttTask: GanttTaskType) => {
        if (ganttTask.type === "milestone") return; 

        const originalTask = tasks.find((t) => t.id === ganttTask.id);
        if (!originalTask) return;

        updateTask({
            ...originalTask,
            id: originalTask.id,
            workspaceId: originalTask.workspaceId,
            startDate: ganttTask.start.toISOString(),
            dueDate: ganttTask.end.toISOString(),
        });
    };

    const handleTaskClick = (ganttTask: GanttTaskType) => {
        const extendedTask = ganttTask as ExtendedGanttTask;
        
        if (ganttTask.type === "milestone") {
            if (!extendedTask.workspaceId || !extendedTask.originalId) return;
            router.push(`/workspaces/${extendedTask.workspaceId}/events/${extendedTask.originalId}`);
            return;
        } 
        
        if (!extendedTask.workspaceId || !extendedTask.originalId) return;
        router.push(`/workspaces/${extendedTask.workspaceId}/tasks/${extendedTask.originalId}`);
    };

    if (formattedTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] border rounded-lg bg-muted/10 text-muted-foreground p-6 text-center">
                <p className="font-semibold text-lg">No tasks or events found for this filter.</p>
                <p className="text-sm mt-2">Adjust your filters or assign Start/Due dates to your tasks to see them on the Gantt chart.</p>
            </div>
        );
    }

    let columnWidth = 60;
    if (view === ViewMode.Month) columnWidth = 150;
    if (view === ViewMode.Week) columnWidth = 100;
    if (view === ViewMode.Year) columnWidth = 300;

    const dynamicListCellWidth = `${30 + (showTaskName ? 160 : 0) + (showSprint ? 100 : 0) + (showDates ? 140 : 0)}px`; 

    const CustomTaskListHeader = ({ headerHeight }: { headerHeight: number }) => {
        return (
            <div className="flex items-center border-b border-border bg-muted/40 text-foreground font-semibold text-[11px] uppercase tracking-wider px-3" style={{ height: headerHeight }}>
                <div className="w-[30px]">#</div>
                {showTaskName && <div className="w-[160px] pr-4">Task Name</div>}
                {showSprint && <div className="w-[100px] truncate">Sprint</div>}
                {showDates && (
                    <>
                        <div className="w-[70px]">Start</div>
                        <div className="w-[70px]">Due</div>
                    </>
                )}
            </div>
        );
    };

    const CustomTaskListTable = ({ rowHeight, tasks }: { rowHeight: number; tasks: GanttTaskType[] }) => {
        return (
            <div className="flex flex-col bg-background">
                {tasks.map((t) => {
                    const task = t as ExtendedGanttTask;
                    return (
                        <div
                            key={task.id}
                            className={`flex items-center border-b border-border text-xs px-3 hover:bg-muted/30 transition-colors cursor-pointer ${task.type === 'milestone' ? 'text-amber-600 dark:text-amber-500 font-semibold bg-amber-500/5' : 'text-foreground'}`}
                            style={{ height: rowHeight }}
                        >
                            <div className="w-[30px] font-mono text-muted-foreground">{task.type === 'milestone' ? "♦" : task.indexNum}</div>
                            {showTaskName && <div className="w-[160px] pr-4 truncate font-medium" title={task.name}>{task.name}</div>}
                            {showSprint && <div className="w-[100px] truncate text-muted-foreground">{task.sprintName}</div>}
                            {showDates && (
                                <>
                                    <div className="w-[70px] text-muted-foreground">{format(task.start, "dd/MM/yy")}</div>
                                    <div className="w-[70px] text-muted-foreground">{task.type === 'milestone' ? "-" : format(task.end, "dd/MM/yy")}</div>
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
                                <DropdownMenuCheckboxItem checked={showTaskName} onCheckedChange={setShowTaskName}>Task Name</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={showSprint} onCheckedChange={setShowSprint}>Sprint</DropdownMenuCheckboxItem>
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
                    tasks={formattedTasks}
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
                    onClick={handleTaskClick}
                    onDateChange={handleTaskChange}
                />
            </div>
        </div>
    );
};