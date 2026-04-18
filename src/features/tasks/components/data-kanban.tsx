"use client";

import { CustomColumnData, Task } from "../types";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import React, { useCallback, useEffect, useState } from "react";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";
import { PlusIcon, CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { useSession } from "next-auth/react";

type TasksState = Record<string, Task[]>;

interface DataKanbanProps {
    columns: CustomColumnData[];
    tasks: Task[];
    onChangeTasks: (tasks: { id: string; columnId: string; position: number; }[]) => void;
    onChangeColumns: (columns: { id: string; position: number; }[]) => void;
    onCreateColumn?: (name: string) => void; 
    onUpdateColumn?: (id: string, newName: string) => void;
    onDeleteColumn?: (id: string) => void;
};

export const DataKanban = ({ 
    columns, 
    tasks, 
    onChangeTasks, 
    onChangeColumns,
    onCreateColumn,
    onUpdateColumn,
    onDeleteColumn
}: DataKanbanProps) => {

    const { data: session } = useSession();

    const currentUserEmail = session?.user?.email;

    const [orderedColumns, setOrderedColumns] = useState<CustomColumnData[]>([]);
    const [tasksState, setTasksState] = useState<TasksState>({});

    const [isCreatingColumn, setIsCreatingColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState("");

    const workspaceId = tasks[0]?.workspaceId;
    const { data: permissions } = useGetPermissions(workspaceId);
    const allowed = (permissions?.workspaceAdmin || permissions?.isManagerAnywhere) ?? false;

    useEffect(() => {
        const sortedCols = [...columns].sort((a, b) => a.position - b.position);
        setOrderedColumns(sortedCols);

        const newTasksState: TasksState = {};
        sortedCols.forEach(col => {
            newTasksState[col.id] = [];
        });

        tasks.forEach((task) => {
            if (newTasksState[task.columnId]) {
                newTasksState[task.columnId].push(task);
            }
        });

        Object.keys(newTasksState).forEach((colId) => {
            newTasksState[colId].sort((a, b) => a.position - b.position);
        });

        setTasksState(newTasksState);
    }, [columns, tasks]);

    const onDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return;

        const { source, destination, type } = result;

        if (type === "COLUMN") {
            const newOrderedCols = Array.from(orderedColumns);
            const [movedCol] = newOrderedCols.splice(source.index, 1);
            newOrderedCols.splice(destination.index, 0, movedCol);

            setOrderedColumns(newOrderedCols);

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

            let updatePayload: { id: string; columnId: string; position: number; }[] = [];

            setTasksState((prev) => {
                const newTasks = { ...prev };
                const sourceColumn = [...(newTasks[sourceColId] || [])];
                const [movedTask] = sourceColumn.splice(source.index, 1);

                if (!movedTask) return prev;

                const updatedMovedTask = sourceColId !== destColId
                    ? { ...movedTask, columnId: destColId }
                    : movedTask;

                newTasks[sourceColId] = sourceColumn;
                const destColumn = [...(newTasks[destColId] || [])];
                destColumn.splice(destination.index, 0, updatedMovedTask);
                newTasks[destColId] = destColumn;

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

                return newTasks;
            });

            onChangeTasks(updatePayload);
        }
    }, [orderedColumns, onChangeTasks, onChangeColumns]);

    const handleCreateSubmit = () => {
        if (newColumnName.trim() !== "" && onCreateColumn) {
            onCreateColumn(newColumnName.trim());
            setNewColumnName("");
            setIsCreatingColumn(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            {allowed && (
            <div className="flex items-center justify-end mb-4 px-2 shrink-0">
                {isCreatingColumn ? (
                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md border border-border">
                        <Input 
                            value={newColumnName}
                            onChange={(e) => setNewColumnName(e.target.value)}
                            placeholder="Enter column name..."
                            className="h-8 text-sm w-[200px]"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreateSubmit();
                                if (e.key === "Escape") {
                                    setIsCreatingColumn(false);
                                    setNewColumnName("");
                                }
                            }}
                        />
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="size-8 text-emerald-500 hover:bg-emerald-500/10"
                            onClick={handleCreateSubmit}
                            disabled={!newColumnName.trim()}
                        >
                            <CheckIcon className="size-4" />
                        </Button>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="size-8 text-rose-500 hover:bg-rose-500/10"
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
                        className="shadow-sm bg-background hover:bg-muted"
                        onClick={() => setIsCreatingColumn(true)}
                    >
                        <PlusIcon className="size-4 mr-2" />
                        New Column
                    </Button>
                )}
            </div>
            )}
            
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="flex overflow-x-auto custom-scrollbar pb-4 h-full"> 
                            
                            {orderedColumns.map((col, index) => (
                                <Draggable key={col.id} draggableId={col.id} index={index} isDragDisabled={!allowed}>
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
                                                    taskCount={tasksState[col.id]?.length || 0} 
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