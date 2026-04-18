"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { PlusIcon, Calendar, CheckCircle, ListTodo, Banknote, FolderGit2 } from "lucide-react";
import Link from "next/link";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Badge } from "@/components/ui/badge";
import { DateIndicator } from "@/components/date-indicator";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";

interface ProjectsListProps {
    data: any[];
}

export const ProjectsList = ({ data }: ProjectsListProps) => {

    const { open: createProject } = useCreateProjectModal();
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    const { data: permissions } = useGetPermissions(workspaceId);

    const isAdmin = permissions?.workspaceAdmin?? false;

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted/50 border border-border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-foreground">
                        Projects at Risk ({data.length})
                    </p>

                    {isAdmin && (
                    <Button variant="outline" size="icon" onClick={createProject} className="bg-background">
                        <PlusIcon className="size-4 text-foreground" />
                    </Button>
                    )}
                    
                </div>
                <Separator className="my-2 bg-border" />

                <ul className="space-y-2">
                    {data.map((project) => (
                        <li key={project.id}>
                            <Link href={`/workspaces/${workspaceId}/projects/${project.id}`}>
                                <Card className="shadow-none rounded-lg hover:bg-accent/50 transition p-0 border border-border hover:border-primary/40 bg-card">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col gap-y-3">
                                            
                                            <div className="flex items-start justify-between w-full gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <ProjectAvatar
                                                        name={project.name}
                                                        image={project.imageUrl} 
                                                        className="size-10 shrink-0"
                                                        fallbackClassName="text-lg"
                                                    />
                                                    <div>
                                                        <p className="text-lg font-medium text-foreground truncate">
                                                            {project.name}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mt-0.5">
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
                                                <Badge className="shrink-0" variant={project.status === "OVER_DUE" ? "destructive" : "secondary"}>
                                                    {project.status?.replace("_", " ")}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                                                    {project.budget ? (
                                                        <div className="flex items-center gap-x-1.5 text-xs text-muted-foreground">
                                                            <Banknote className="size-3.5" />
                                                            <span>${project.budget.toLocaleString()}</span>
                                                        </div>
                                                    ) : null}
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
                                <div className="mx-auto size-12 bg-muted rounded-full flex items-center justify-center mb-3">
                                    <FolderGit2 className="size-6 text-muted-foreground/70" />
                                </div>
                                <p className="text-lg font-medium text-foreground">Projects on track!</p>
                                <p className="text-sm">No projects are at risk or due in the next 7 days.</p>
                            </div>
                        </li>
                    )}
                </ul>

                <Button variant="secondary" className="mt-3 w-full bg-background hover:bg-muted/50" asChild>
                    <Link href={`/workspaces/${workspaceId}/projects`}>
                        View All Projects
                    </Link>
                </Button>
            </div>
        </div>
    );
};