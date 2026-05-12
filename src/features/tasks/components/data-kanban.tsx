"use client";

import { CustomColumnData, Task } from "../types";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";
import { PlusIcon, CheckIcon, XIcon, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { useSession } from "next-auth/react";
import { useUpdateTask } from "../api/use-update-task";
import { useGetSprints } from "@/features/sprints/api/use-get-sprints";
import { useGetProjectMembers } from "@/features/members/api/use-get-project-members";
import { ColumnCategory } from "@prisma/client";

type TasksState = Record<string, any[]>;
type GroupByOption = "status" | "assignee" | "sprint";

interface DataKanbanProps {
    columns: CustomColumnData[];
    tasks: any[];
    onChangeTasks: (tasks: { id: string; columnId: string; position: number; }[]) => void;
    onChangeColumns: (columns: { id: string; position: number; }[]) => void;
    onCreateColumn?: (name: string, category: ColumnCategory) => void; 
    onUpdateColumn?: (id: string, newName: string) => void;
    onDeleteColumn?: (id: string) => void;
    openSprintModal?: (projectId: string) => void;
    projectId: string;
};

export const DataKanban = ({ 
    columns, 
    tasks, 
    onChangeTasks, 
    onChangeColumns,
    onCreateColumn,
    openSprintModal,
    projectId
}: DataKanbanProps) => {

    const { data: session } = useSession();
    const currentUserEmail = session?.user?.email;

    const { data: sprintsData } = useGetSprints(projectId);
    const { data: membersData } = useGetProjectMembers(projectId);

    const [groupBy, setGroupBy] = useState<GroupByOption>("status");
    const [tasksState, setTasksState] = useState<TasksState>({});

    const [isCreatingColumn, setIsCreatingColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState("");
    const [newColumnCategory, setNewColumnCategory] = useState<ColumnCategory>(ColumnCategory.TODO);

    const workspaceId = tasks[0]?.workspaceId;
    const { data: permissions } = useGetPermissions(workspaceId);
    const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];
    const allowed = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.TASK_UPDATE_STATUS);

    const { mutate: updateTask } = useUpdateTask();

    const dynamicColumns = useMemo(() => {
        if (groupBy === "status") {
            return [...columns].sort((a, b) => a.position - b.position).map(c => ({ id: c.id, name: c.name, category: c.category }));
        }
        
        if (groupBy === "assignee") {
            const cols = [{ id: "unassigned", name: "Unassigned" }];
            const existingIds = new Set(["unassigned"]);
            
            const membersArray = Array.isArray(membersData) ? membersData : Array.isArray(membersData?.data) ? membersData.data : [];

            membersArray.forEach((m: any) => {
                if (!existingIds.has(m.userId)) {
                    cols.push({ id: m.userId, name: m.name || "Unknown" });
                    existingIds.add(m.userId);
                }
            });

            tasks.forEach(t => {
                if (t.assigneeId && t.assignee && !existingIds.has(t.assigneeId)) {
                    cols.push({ id: t.assigneeId, name: t.assignee.name || "Unknown" });
                    existingIds.add(t.assigneeId);
                }
            });

            return cols;
        }

        if (groupBy === "sprint") {
            const cols = [{ id: "backlog", name: "Backlog" }];
            const existingIds = new Set(["backlog"]);

            const sprintsArray = Array.isArray(sprintsData) ? sprintsData : Array.isArray(sprintsData) ? sprintsData : [];

            const sortedSprints = [...sprintsArray].sort((a: any, b: any) => {
                const numA = typeof a.sprintNumber === "number" ? a.sprintNumber : 0;
                const numB = typeof b.sprintNumber === "number" ? b.sprintNumber : 0;
                return numA - numB;
            });

            sortedSprints.forEach((s: any) => {
                if (!existingIds.has(s.id)) {
                    cols.push({ id: s.id, name: s.name });
                    existingIds.add(s.id);
                }
            });

            tasks.forEach(t => {
                if (t.sprintId && t.sprint && !existingIds.has(t.sprintId)) {
                    cols.push({ id: t.sprintId, name: t.sprint.name || "Unknown Sprint" });
                    existingIds.add(t.sprintId);
                }
            });

            return cols;
        }

        return [];
    }, [columns, tasks, groupBy, sprintsData, membersData]);

    useEffect(() => {
        const newTasksState: TasksState = {};
        dynamicColumns.forEach(col => {
            newTasksState[col.id] = [];
        });

        tasks.forEach((task) => {
            let key = task.columnId;
            if (groupBy === "assignee") key = task.assigneeId || "unassigned";
            if (groupBy === "sprint") key = task.sprintId || "backlog";

            if (newTasksState[key]) {
                newTasksState[key].push(task);
            }
        });

        if (groupBy === "status") {
            Object.keys(newTasksState).forEach((colId) => {
                newTasksState[colId].sort((a, b) => a.position - b.position);
            });
        }

        setTasksState(newTasksState);
    }, [dynamicColumns, tasks, groupBy]);

    const onDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return;

        const { source, destination, type } = result;

        if (type === "COLUMN") {
            if (groupBy !== "status") return; 

            const newOrderedCols = Array.from(dynamicColumns);
            const [movedCol] = newOrderedCols.splice(source.index, 1);
            newOrderedCols.splice(destination.index, 0, movedCol);

            const columnUpdatePayload = newOrderedCols.map((col, index) => ({
                id: col.id,
                position: (index + 1) * 1000
            }));
            
            onChangeColumns(columnUpdatePayload);
            return;
        }

        if (type === "TASK") {
            const sourceColId = source.droppableId;
            const destColId = destination.droppableId;

            let movedTaskGlobal: any = null;

            setTasksState((prev) => {
                const newTasks = { ...prev };
                const sourceColumn = [...(newTasks[sourceColId] || [])];
                const [movedTask] = sourceColumn.splice(source.index, 1);

                if (!movedTask) return prev;
                movedTaskGlobal = movedTask;

                const updatedMovedTask = sourceColId !== destColId
                    ? { ...movedTask, columnId: groupBy === "status" ? destColId : movedTask.columnId }
                    : movedTask;

                newTasks[sourceColId] = sourceColumn;
                const destColumn = [...(newTasks[destColId] || [])];
                destColumn.splice(destination.index, 0, updatedMovedTask);
                newTasks[destColId] = destColumn;

                if (groupBy === "status") {
                    let updatePayload: { id: string; columnId: string; position: number; }[] = [];
                    updatePayload.push({
                        id: updatedMovedTask.id,
                        columnId: destColId,
                        position: Math.min((destination.index + 1) * 1000, 1_000_000)
                    });

                    newTasks[destColId].forEach((task, index) => {
                        if (task && task.id !== updatedMovedTask.id) {
                            const newPos = Math.min((index + 1) * 1000, 1_000_000);
                            if (task.position !== newPos) {
                                updatePayload.push({ id: task.id, columnId: destColId, position: newPos });
                            }
                        }
                    });

                    if (sourceColId !== destColId) {
                        newTasks[sourceColId].forEach((task, index) => {
                            if (task) {
                                const newPos = Math.min((index + 1) * 1000, 1_000_000);
                                if (task.position !== newPos) {
                                    updatePayload.push({ id: task.id, columnId: sourceColId, position: newPos });
                                }
                            }
                        });
                    }
                    onChangeTasks(updatePayload);
                }

                return newTasks;
            });

            if (movedTaskGlobal && sourceColId !== destColId) {
                if (groupBy === "assignee") {
                    updateTask({
                        id: movedTaskGlobal.id,
                        projectId: movedTaskGlobal.projectId,
                        name: movedTaskGlobal.name,
                        description: movedTaskGlobal.description || "",
                        columnId: movedTaskGlobal.columnId,
                        sprintId: movedTaskGlobal.sprintId || "",
                        assigneeId: destColId === "unassigned" ? "" : destColId,
                        taskType: movedTaskGlobal.taskType,
                        priority: movedTaskGlobal.priority,
                        effortPoints: movedTaskGlobal.effortPoints,
                        budget: movedTaskGlobal.budget,
                        currency: movedTaskGlobal.currency,
                        startDate: movedTaskGlobal.startDate ? new Date(movedTaskGlobal.startDate).toISOString() : undefined,
                        dueDate: movedTaskGlobal.dueDate ? new Date(movedTaskGlobal.dueDate).toISOString() : undefined,
                    });
                } else if (groupBy === "sprint") {
                    updateTask({
                        id: movedTaskGlobal.id,
                        projectId: movedTaskGlobal.projectId,
                        name: movedTaskGlobal.name,
                        description: movedTaskGlobal.description || "",
                        columnId: movedTaskGlobal.columnId,
                        sprintId: destColId === "backlog" ? "" : destColId,
                        assigneeId: movedTaskGlobal.assigneeId || "",
                        taskType: movedTaskGlobal.taskType,
                        priority: movedTaskGlobal.priority,
                        effortPoints: movedTaskGlobal.effortPoints,
                        budget: movedTaskGlobal.budget,
                        currency: movedTaskGlobal.currency,
                        startDate: movedTaskGlobal.startDate ? new Date(movedTaskGlobal.startDate).toISOString() : undefined,
                        dueDate: movedTaskGlobal.dueDate ? new Date(movedTaskGlobal.dueDate).toISOString() : undefined,
                    });
                }
            }
        }
    }, [dynamicColumns, groupBy, onChangeTasks, onChangeColumns, updateTask]);

    const handleCreateSubmit = () => {
        if (newColumnName.trim() !== "" && onCreateColumn) {
            onCreateColumn(newColumnName.trim(), newColumnCategory);
            setNewColumnName("");
            setNewColumnCategory(ColumnCategory.TODO);
            setIsCreatingColumn(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-3 px-2 shrink-0 gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto bg-muted/50 p-1.5 rounded-lg border border-border">
                    <LayoutTemplate className="size-4 text-muted-foreground ml-1 hidden sm:block" />
                    <Select value={groupBy} onValueChange={(val: GroupByOption) => setGroupBy(val)}>
                        <SelectTrigger className="h-5 w-full sm:w-[200px] border-none shadow-none bg-transparent focus:ring-0">
                            <span className="text-muted-foreground mr-2">Group by:</span>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="status">Columns</SelectItem>
                            <SelectItem value="assignee">Assignee</SelectItem>
                            <SelectItem value="sprint">Sprint</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full sm:w-auto">
                    {allowed && groupBy === "status" && (
                        isCreatingColumn ? (
                            <div className="flex flex-wrap items-center gap-2 bg-muted/50 p-1 rounded-md border border-border">
                                <Input 
                                    value={newColumnName}
                                    onChange={(e) => setNewColumnName(e.target.value)}
                                    placeholder="Column Name..."
                                    className="h-8 text-sm w-full sm:w-[150px]"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleCreateSubmit();
                                        if (e.key === "Escape") {
                                            setIsCreatingColumn(false);
                                            setNewColumnName("");
                                        }
                                    }}
                                />
                                <Select value={newColumnCategory} onValueChange={(val: ColumnCategory) => setNewColumnCategory(val)}>
                                    <SelectTrigger className="h-8 w-[120px] text-xs">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ColumnCategory.TODO}>To Do</SelectItem>
                                        <SelectItem value={ColumnCategory.IN_PROGRESS}>In Progress</SelectItem>
                                        <SelectItem value={ColumnCategory.DONE}>Done</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="size-8 text-emerald-500 hover:bg-emerald-500/10 shrink-0"
                                    onClick={handleCreateSubmit}
                                    disabled={!newColumnName.trim()}
                                >
                                    <CheckIcon className="size-4" />
                                </Button>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="size-8 text-rose-500 hover:bg-rose-500/10 shrink-0"
                                    onClick={() => {
                                        setIsCreatingColumn(false);
                                        setNewColumnName("");
                                    }}
                                >
                                    <XIcon className="size-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="shadow-sm bg-background hover:bg-muted w-full sm:w-auto"
                                onClick={() => setIsCreatingColumn(true)}
                            >
                                <PlusIcon className="size-4 mr-2" />
                                New Column
                            </Button>
                        )
                    )}

                    {allowed && groupBy === "sprint" && openSprintModal && (
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="shadow-sm bg-background hover:bg-muted w-full sm:w-auto"
                            onClick={() => openSprintModal(projectId)}
                        >
                            <PlusIcon className="size-4 mr-2" />
                            New Sprint
                        </Button>
                    )}
                </div>
            </div>
            
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="flex overflow-x-auto custom-scrollbar pb-4 h-full flex-1"> 
                            
                            {dynamicColumns.map((col, index) => (
                                <Draggable key={col.id} draggableId={col.id} index={index} isDragDisabled={!allowed || groupBy !== "status"}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="flex-shrink-0 mx-2 bg-muted/40 border border-border p-1.5 rounded-xl w-[300px] flex flex-col"
                                        >
                                            <div {...provided.dragHandleProps}>
                                                <KanbanColumnHeader 
                                                    columnId={col.id}
                                                    board={col.name} 
                                                    category={(col as any).category}
                                                    taskCount={tasksState[col.id]?.length || 0} 
                                                    groupBy={groupBy}
                                                    projectId={projectId}
                                                />
                                            </div>
                                            <Droppable droppableId={col.id} type="TASK">
                                                {(provided) => (
                                                    <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-[200px] py-1.5 flex-1">
                                                        {tasksState[col.id]?.map((task, taskIndex) => {
                                                            const taskAny = task as any;

                                                            const taskAssigneeEmail = taskAny.assignee?.email;
                                                            const isAssignee = Boolean(currentUserEmail && taskAssigneeEmail && taskAssigneeEmail === currentUserEmail);
                                                            
                                                            const canDragTask = allowed || isAssignee;

                                                            return (
                                                                <Draggable key={task.id} draggableId={task.id} index={taskIndex} isDragDisabled={!canDragTask}>
                                                                    {(provided) => (
                                                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                            <KanbanCard task={task as Task} />
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            );
                                                        })}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                            
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};