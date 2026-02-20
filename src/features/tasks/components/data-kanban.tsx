"use client";

import { Task, TaskStatus } from "../types";
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
} from "@hello-pangea/dnd";
import React, { useCallback, useEffect, useState } from "react";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";

const boards: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE,
];

type TasksState = {
    [key in TaskStatus]: Task[];
};

interface DataKanbanProps {
    data: Task[];
    onChange: (tasks: { id: string; status: TaskStatus; position: number; }[] ) => void;
};

export const DataKanban = ({
    data,
    onChange,
}: DataKanbanProps) => {

    const [tasks, setTasks] = useState<TasksState>(() => {
        const initialTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };

        data.forEach((task) => {
            if (initialTasks[task.taskStatus as TaskStatus]) {
                initialTasks[task.taskStatus as TaskStatus].push(task);
            }
        });

        Object.keys(initialTasks).forEach((status) => {
            const key = status as TaskStatus;
            initialTasks[key].sort((a, b) => a.position - b.position);
        });

        return initialTasks;
    });

    useEffect(() => {
        const newTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };

        data.forEach((task) => {
            if (newTasks[task.taskStatus as TaskStatus]) {
                newTasks[task.taskStatus as TaskStatus].push(task);
            }
        });

        Object.keys(newTasks).forEach((status) => {
            const key = status as TaskStatus;
            newTasks[key].sort((a, b) => a.position - b.position);
        });

        setTasks(newTasks);
    }, [data]);

    const onDragEnd = useCallback((result: DropResult) => {
        if(!result.destination) return;

        const { source, destination } = result;
        const sourceStatus = source.droppableId as TaskStatus;
        const destStatus = destination.droppableId as TaskStatus;

        let updatePayload: {
            id: string;
            status: TaskStatus;
            position: number;
        } [] = [];

        setTasks((prevTasks) => {
            const newTasks = {...prevTasks};

            const sourceColumn = [...newTasks[sourceStatus]];
            const [movedTask] = sourceColumn.splice(source.index, 1);

            if(!movedTask) {
                return prevTasks;
            }

            const updatedMovedTask = sourceStatus !== destStatus
                ? { ...movedTask, taskStatus: destStatus }
                : movedTask;

            newTasks[sourceStatus] = sourceColumn;

            const destColumn =  [...newTasks[destStatus]];
            destColumn.splice(destination.index, 0, updatedMovedTask);
            newTasks[destStatus] = destColumn;

            updatePayload = [];

            updatePayload.push({
                id: updatedMovedTask.id || updatedMovedTask.id,
                status: destStatus,
                position: Math.min((destination.index + 1) * 1000, 1_000_000)
            });

            newTasks[destStatus].forEach((task, index) => {
                if(task && (task.id || task.id) !== (updatedMovedTask.id || updatedMovedTask.id)) {
                    const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                    if(task.position !== newPosition) {
                        updatePayload.push({
                            id: task.id || task.id,
                            status: destStatus,
                            position: newPosition,
                        });
                    }
                }
            });

            if(sourceStatus !== destStatus){
                newTasks[sourceStatus].forEach((task, index) => {
                    if(task) {
                        const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                        if( task.position !== newPosition ) {
                            updatePayload.push({
                                id: task.id || task.id,
                                status: sourceStatus,
                                position: newPosition,
                            });
                        }
                    }
                });
            }

            return newTasks;
        });

        onChange(updatePayload);
    }, [onChange]);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto custom-scrollbar pb-2"> 
                {boards.map((board) => (
                    <div
                        key={board}
                        className="flex-1 mx-1 bg-muted/40 border border-border p-1.5 rounded-xl min-w-[200px] flex flex-col"
                    >
                        <KanbanColumnHeader
                            board={board}
                            taskCount={tasks[board].length}
                        />
                        <Droppable droppableId={board}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef} 
                                    className="min-h-[200px] py-1.5 flex-1"
                                >
                                    {tasks[board].map((task, index) => (
                                        <Draggable
                                            key={task.id || task.id}
                                            draggableId={task.id || task.id}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <KanbanCard task={task} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
};