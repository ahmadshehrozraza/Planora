"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { PlusIcon, CalendarIcon, ListTodo, GitBranch } from "lucide-react";
import Link from "next/link";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { DateIndicator } from "@/components/date-indicator";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";

export const TasksList = ({ data }: { data: any[] }) => {
    const { open: createTask } = useCreateTaskModal();
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    const { data: permissions } = useGetPermissions( workspaceId );

    const allowed = (permissions?.workspaceAdmin || permissions?.isManagerAnywhere) ?? false;

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted/50 rounded-lg p-4 border border-border shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-foreground">
                        Requires Attention ({data.length})
                    </p>

                    {allowed && (
                    <Button variant="outline" size="icon" onClick={createTask} className="bg-background">
                        <PlusIcon className="size-4 text-foreground" />
                    </Button>
                    )}
                    
                </div>
                <Separator className="my-2 bg-border" />

                <ul className="flex flex-col gap-y-3">
                    {data.map((task) => {
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

                        return (
                            <li key={task.id}>
                                <Link href={`/workspaces/${workspaceId}/tasks/${task.id}`}>
                                    <Card className="shadow-none rounded-lg hover:bg-accent/50 transition-all duration-200 border border-border bg-card">
                                        <CardContent className="p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-base font-semibold text-foreground truncate">
                                                            {task.name}
                                                        </p>
                                                        {task.branchName && (
                                                            <div className="flex items-center gap-1 text-muted-foreground ml-1">
                                                                <GitBranch className="size-3.5" />
                                                                <span className="font-mono text-[10px] truncate max-w-[80px]">{task.branchName}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center px-2 rounded-md text-xs font-medium shrink-0">
                                                    <Badge variant="outline">
                                                        {task.column?.name || "Pending"}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between mt-2 gap-2">
                                                <div className="flex items-center gap-x-3 min-w-0">
                                                    <div className="flex items-center gap-x-2 min-w-0">
                                                        <ProjectAvatar
                                                            name={task.project?.name || "Project"}
                                                            image={task.project?.imageUrl}
                                                            className="size-6 shrink-0"
                                                            fallbackClassName="text-xs font-semibold"
                                                        />
                                                        <span className="text-sm text-foreground font-medium truncate max-w-[120px]">
                                                            {task.project?.name}
                                                        </span>
                                                    </div>

                                                    {task.priority && (
                                                        <div className="px-2 py-0.5 rounded text-[10px] uppercase font-bold border shrink-0">
                                                            {task.priority}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={`text-sm flex items-center gap-x-1 shrink-0 ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                                    <CalendarIcon className="size-4 shrink-0" />
                                                    <DateIndicator value={task.dueDate} />
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
                                <p className="text-lg font-medium text-foreground">All caught up!</p>
                                <p className="text-sm">No urgent tasks due in the next 7 days.</p>
                            </div>
                        </li>
                    )}
                </ul>
                <Button variant="secondary" className="mt-3 w-full bg-background" asChild>
                    <Link href={`/workspaces/${workspaceId}/tasks`}>View All Tasks</Link>
                </Button>
            </div>
        </div>
    );
};