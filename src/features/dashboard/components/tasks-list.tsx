"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { Task } from "@/features/tasks/types";
import { Member } from "@/features/members/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { formatDistanceToNow } from "date-fns";
import { PlusIcon, CalendarIcon, ArrowUpRight, ListTodo } from "lucide-react";
import Link from "next/link";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { DateIndicator } from "@/components/date-indicator";

interface TasksListProps {
    data: Task[];
    total: number;
    members: Member[];
}

export const TasksList = ({ data, total, members }: TasksListProps) => {
    const { open: createTask } = useCreateTaskModal();
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-foreground">
                        Tasks ({total})
                    </p>
                    <Button variant="outline" size="icon" onClick={createTask} className="bg-background">
                        <PlusIcon className="size-4 text-foreground" />
                    </Button>
                </div>
                <Separator className="my-2 bg-border" />

                <ul className="flex flex-col gap-y-3">
                    {data.map((task) => {
                        const isOverdue = task.endDate && new Date(task.endDate) < new Date();

                        return (
                            <li key={task.id}>
                                <Link href={`/workspaces/${workspaceId}/tasks/${task.id}`}>
                                    <Card className="shadow-sm rounded-lg hover:bg-accent/50 hover:shadow-md transition-all duration-200 border border-border bg-card">
                                        <CardContent className="p-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-base font-semibold text-foreground line-clamp-1">
                                                        {task.name}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-x-1 px-2 rounded-md text-xs font-medium">
                                                    <Badge variant={task.taskStatus as any}>
                                                        {snakeCaseToTitleCase(task.taskStatus)}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-center gap-x-4">
                                                    <div className="flex items-center gap-x-2">
                                                        <ProjectAvatar
                                                            name={"Project"}
                                                            className="size-6"
                                                            fallbackClassName="text-xs font-semibold"
                                                        />
                                                        <span className="text-sm text-foreground font-medium">
                                                            {"Project"}
                                                        </span>
                                                    </div>

                                                    {task.taskPriority && (
                                                        <div className="px-2 py-1 rounded text-xs font-medium">
                                                            <Badge variant={task.taskPriority as any}>{task.taskPriority}</Badge>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={`text-sm flex items-center gap-x-1 ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                                    <CalendarIcon className="size-4" />
                                                    <DateIndicator value={task.endDate} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </li>
                        );
                    })}

                    {data.length === 0 && (
                        <li className="text-center py-8">
                            <div className="text-muted-foreground">
                                <div className="mx-auto size-12 bg-muted rounded-full flex items-center justify-center mb-3">
                                    <ListTodo className="size-6 text-muted-foreground/70" />
                                </div>
                                <p className="text-lg font-medium text-foreground">No tasks found</p>
                                <p className="text-sm">Create your first task to get started</p>
                            </div>
                        </li>
                    )}
                </ul>
                <Button variant="secondary" className="mt-3 w-full" asChild>
                    <Link href={`/workspaces/${workspaceId}/tasks`}>
                        View All Tasks
                    </Link>
                </Button>
            </div>
        </div>
    );
};