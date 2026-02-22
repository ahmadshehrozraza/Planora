"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { DummyProject } from "@/features/projects/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { PlusIcon, Calendar, CheckCircle, ListTodo, Users, Banknote } from "lucide-react";
import Link from "next/link";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useCurrentMember } from "@/features/members/hooks/current-user-role";
import { Badge } from "@/components/ui/badge";
import { DateIndicator } from "@/components/date-indicator";

interface ProjectsListProps {
    data: DummyProject[];
    total: number;
}

export const ProjectsList = ({ data, total }: ProjectsListProps) => {
    const { isAdmin } = useCurrentMember();
    const { open: createProject } = useCreateProjectModal();
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted/50 border border-border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-foreground">
                        Projects ({total})
                    </p>

                        <Button variant="outline" size="icon" onClick={createProject}>
                            <PlusIcon className="size-4 text-foreground" />
                        </Button>

                </div>
                <Separator className="my-2 bg-border" />

                <ul className="space-y-2">
                    {data.map((project) => (
                        <li key={project.id}>
                            <Link href={`/workspaces/${workspaceId}/projects/${project.id}`}>
                                <Card className="shadow-none rounded-lg hover:bg-accent/50 transition p-0 border border-border hover:border-primary/40 bg-card">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col gap-y-3">
                                            <div className="flex items-center justify-between w-full gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <ProjectAvatar
                                                        name={project.name}
                                                        className="size-10 shrink-0"
                                                        fallbackClassName="text-lg"
                                                    />
                                                    <div>
                                                    <p className="text-lg font-medium text-foreground truncate">
                                                        {project.name}
                                                    </p>
                                                    <div className="flex gap-2">
                                                    <div className="flex items-center gap-x-1.5 text-xs text-muted-foreground">
                                                        <ListTodo className="size-3.5" />
                                                        <span>{project.totalTasks || 0} tasks</span>
                                                    </div>

                                                    {project.completedTasks !== undefined && (
                                                        <div className="flex items-center gap-x-1.5 text-xs text-muted-foreground">
                                                            <CheckCircle className="size-3.5" />
                                                            <span>{project.completedTasks} completed</span>
                                                        </div>
                                                    )}
                                                    </div>
                                                    </div>
                                                </div>
                                                <Badge className="shrink-0" variant={project.projectStatus as any}>
                                                    {project.projectStatus}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                                                    
                                                    <div className="flex items-center gap-x-1.5 text-xs text-muted-foreground">
                                                        <Users className="size-3.5" />
                                                        <span>{5} members</span>
                                                    </div>

                                                    <div className="flex items-center gap-x-1.5 text-xs text-muted-foreground">
                                                        <Banknote className="size-3.5" />
                                                        <span>${project.budget || "10,000"}</span>
                                                    </div>
                                                </div>
                                                {project.dueDate && (
                                                    <div className={`flex items-center gap-x-1.5 text-xs shrink-0 mt-1 ${new Date(project.dueDate) < new Date() ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                                        <Calendar className="size-3.5" />
                                                        <span>
                                                            <DateIndicator value={project.dueDate} />
                                                        </span>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </li>
                    ))}

                    {data.length === 0 && (
                        <li className="text-center py-8">
                            <div className="text-muted-foreground">
                                <p className="text-lg font-medium text-foreground">No projects found</p>
                                <p className="text-sm">Create your first project to get started</p>
                            </div>
                        </li>
                    )}
                </ul>

                {isAdmin && (
                    <Button variant="outline" className="mt-3 w-full border-dashed bg-background hover:bg-muted/50" onClick={createProject}>
                        <PlusIcon className="size-4 mr-2" />
                        Add New Project
                    </Button>
                )}
            </div>
        </div>
    );
};