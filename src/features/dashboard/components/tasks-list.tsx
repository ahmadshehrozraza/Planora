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
import { PERMISSIONS } from "@/lib/permissions-constants";
import { snakeCaseToTitleCase } from "@/lib/utils";

export const TasksList = ({ data }: { data: any[] }) => {
    const { open: createTask } = useCreateTaskModal();
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    const { data: permissions } = useGetPermissions( workspaceId );
    const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];

    const allowed = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.TASK_CREATE);

    return (
        <div className="flex flex-col col-span-1">
            <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-base font-bold text-foreground flex items-center gap-2">
                        <ListTodo className="size-4 text-primary" />
                        Requires Attention <span className="text-muted-foreground font-normal text-xs ml-1">({data.length})</span>
                    </p>

                    {allowed && (
                    <Button variant="ghost" size="icon" onClick={createTask} className="size-8 hover:bg-primary/10 hover:text-primary">
                        <PlusIcon className="size-4" />
                    </Button>
                    )}
                </div>
                <Separator className="my-4 bg-border/60" />

                <ul className="flex flex-col gap-y-2.5">
                    {data.map((task) => {
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

                        return (
                            <li key={task.id}>
                                <Link href={`/workspaces/${workspaceId}/tasks/${task.id}`}>
                                    <Card className="shadow-none rounded-lg hover:bg-accent/40 transition-colors duration-200 border border-border/60 bg-transparent group">
                                        <CardContent className="p-3">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                            {task.name}
                                                        </p>
                                                    </div>
                                                    <Badge variant="secondary" className="shrink-0 font-medium text-[10px] px-1.5 py-0 h-4.5 bg-muted">
                                                        {task.column?.name || "Pending"}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center justify-between mt-1">
                                                    <div className="flex items-center gap-x-2 min-w-0">
                                                        <ProjectAvatar
                                                            name={task.project?.name || "Project"}
                                                            image={task.project?.imageUrl}
                                                            className="size-5 border border-border/50 shrink-0"
                                                            fallbackClassName="text-[8px] font-bold"
                                                        />
                                                        <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
                                                            {task.project?.name}
                                                        </span>
                                                        {task.priority && (
                                                            <div className="size-1 rounded-full bg-border shrink-0 ml-1" />
                                                        )}
                                                        {task.priority && (
                                                            <span className="text-[10px] font-bold uppercase text-muted-foreground shrink-0 ml-1">
                                                                {task.priority}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className={`flex items-center gap-x-1.5 shrink-0 ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground font-medium'}`}>
                                                        <CalendarIcon className="size-3.5 shrink-0" />
                                                        <DateIndicator value={task.dueDate} className="text-xs" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </li>
                        );
                    })}

                    {data.length === 0 && (
                        <li className="text-center py-6">
                            <div className="text-muted-foreground flex flex-col items-center">
                                <div className="size-10 bg-muted/50 rounded-full flex items-center justify-center mb-2">
                                    <ListTodo className="size-5 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm font-medium text-foreground">All caught up!</p>
                                <p className="text-xs mt-0.5">No urgent tasks due in the next 7 days.</p>
                            </div>
                        </li>
                    )}
                </ul>
                <Button variant="secondary" className="mt-4 w-full bg-muted/50 hover:bg-muted font-medium text-xs h-9" asChild>
                    <Link href={`/workspaces/${workspaceId}/tasks`}>View All Tasks</Link>
                </Button>
            </div>
        </div>
    );
};