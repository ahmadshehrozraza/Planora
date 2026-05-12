"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { PlusIcon, Calendar, FolderGit2 } from "lucide-react";
import Link from "next/link";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Badge } from "@/components/ui/badge";
import { DateIndicator } from "@/components/date-indicator";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";

interface ProjectsListProps {
    data: any[];
}

export const ProjectsList = ({ data }: ProjectsListProps) => {

    const { open: createProject } = useCreateProjectModal();
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    const { data: permissions } = useGetPermissions(workspaceId);
    const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];

    const isAdmin = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.PROJECT_CREATE);

    return (
        <div className="flex flex-col col-span-1">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-base font-bold text-foreground flex items-center gap-2">
                        <FolderGit2 className="size-4 text-primary" />
                        Projects at Risk <span className="text-muted-foreground font-normal text-xs ml-1">({data.length})</span>
                    </p>

                    {isAdmin && (
                    <Button variant="ghost" size="icon" onClick={createProject} className="size-8 hover:bg-primary/10 hover:text-primary">
                        <PlusIcon className="size-4" />
                    </Button>
                    )}
                </div>
                <Separator className="my-4 bg-border/60" />

                <ul className="space-y-2.5">
                    {data.map((project) => (
                        <li key={project.id}>
                            <Link href={`/workspaces/${workspaceId}/projects/${project.id}`}>
                                <Card className="shadow-none rounded-lg hover:bg-accent/40 transition-colors duration-200 p-0 border border-border/60 bg-transparent group">
                                    <CardContent className="p-3">
                                        <div className="flex flex-col gap-y-2">
                                            <div className="flex items-start justify-between w-full gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <ProjectAvatar
                                                        name={project.name}
                                                        image={project.imageUrl} 
                                                        className="size-8 shrink-0 border border-border/50"
                                                        fallbackClassName="text-xs"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                            {project.name}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                                                            <span className="font-medium">{project.completedTasks || 0} / {project.totalTasks || 0} Tasks</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge className="shrink-0 text-[9px] uppercase tracking-wider px-1.5 py-0 shadow-none" variant={project.status === "ACTIVE" ? "ACTIVE" : "destructive"}>
                                                    {project.status?.replace("_", " ")}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between mt-1 border-t border-border/30 pt-2">
                                                <div className="flex items-center gap-x-2 text-[10px] font-medium">
                                                    <span className="text-muted-foreground">Progress:</span>
                                                    <span className="text-foreground">{project.progress || 0}%</span>
                                                </div>
                                                
                                                {project.dueDate && (
                                                    <div className={`flex items-center gap-x-1.5 text-xs shrink-0 ${new Date(project.dueDate) < new Date() ? 'text-destructive font-semibold' : 'text-muted-foreground font-medium'}`}>
                                                        <Calendar className="size-3.5" />
                                                        <DateIndicator value={project.dueDate} />
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
                        <li className="text-center py-6">
                            <div className="text-muted-foreground flex flex-col items-center">
                                <div className="size-10 bg-muted/50 rounded-full flex items-center justify-center mb-2">
                                    <FolderGit2 className="size-5 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm font-medium text-foreground">Projects on track!</p>
                                <p className="text-xs mt-0.5">No projects are at risk or due in the next 7 days.</p>
                            </div>
                        </li>
                    )}
                </ul>

                <Button variant="secondary" className="mt-4 w-full bg-muted/50 hover:bg-muted font-medium text-xs h-9" asChild>
                    <Link href={`/workspaces/${workspaceId}/projects`}>
                        View All Projects
                    </Link>
                </Button>
            </div>
        </div>
    );
};