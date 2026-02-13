"use client";

import { Analytics } from "@/components/analytics";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { Task } from "@/features/tasks/types";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { formatDistanceToNow } from "date-fns";
import { PlusIcon, CalendarIcon, SettingsIcon } from "lucide-react";
import  Link  from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Project } from "@/features/projects/types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Member } from "@/features/members/types";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useCurrentMember } from "@/features/members/hooks/current-user-role";

export const WorkspaceIdClient = () => {
    
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;
    
       const { isAdmin } = useCurrentMember();

    const { data: workspaceAnalytics, isLoading: isLoadingWorkspaceAnalytics } = useGetWorkspaceAnalytics({ workspaceId });
    const { data: taskAnalytics, isLoading: isLoadingTaskAnalytics } = useGetTasks({ workspaceId });
    const { data: projectAnalytics, isLoading: isLoadingProjectAnalytics } = useGetProjects({ workspaceId });
    const { data: memberAnalytics, isLoading: isLoadingMemberAnalytics } = useGetMembers({ workspaceId });


    const isLoading =
        isLoadingMemberAnalytics ||
        isLoadingWorkspaceAnalytics ||
        isLoadingProjectAnalytics ||
        isLoadingTaskAnalytics;

    if (isLoading) {
        return <PageLoader />;
    }

    if (
        !workspaceAnalytics ||
        !taskAnalytics ||
        !projectAnalytics ||
        !memberAnalytics
    ) {
        console.log("Workspace: ", workspaceAnalytics);
        console.log("task: ", taskAnalytics);
        console.log("project: ", projectAnalytics);
        console.log("member: ", memberAnalytics);
        return <PageError message="Failed to load workspace data" />;
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* <Analytics data={workspaceAnalytics} /> */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <TaskList 
                    data={taskAnalytics.documents}
                    total={taskAnalytics.total}
                />

                <ProjectList
                    data={projectAnalytics.documents}
                    total={projectAnalytics.total}
                />

                { isAdmin &&
                <MembersList
                    data={memberAnalytics.documents}
                    total={memberAnalytics.total}
                />
                }
            </div>
        </div>
    );
};

interface TaskListProps{
    data: Task[];
    total: number;
};

export const TaskList = ({ 
    data,
    total,
}: TaskListProps) => {

    const { open: createTask } = useCreateTaskModal();
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold"> 
                        Tasks ({total})
                    </p>
                    <Button
                        variant="muted"
                        size="icon"
                        onClick={createTask}
                    >
                        <PlusIcon className="size-4 text-neutral-800" />
                    </Button>
                </div>
                <Separator className="my-2" />
                
                <ul className="flex flex-col gap-y-2"> 
                    {data.map((task) => (
                        <li key={task.$id}>
                            <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                            <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                                <CardContent className="p-2">
                                    <p className="text-lg truncate font-medium">{task.name}</p>
                                    <div className="flex items-center gap-x-2">
                                        <p>{task.project?.name}</p>
                                        <div className="size-1 rounded-full bg-neutral-300" />

                                        <div className="text-sm text-muted-foreground flex items-center">
                                            <CalendarIcon className="size-3 mr-1" />
                                            <span className="truncate">
                                                {formatDistanceToNow(new Date(task.dueDate))}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            </Link>
                        </li>
                    ))}

                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        No tasks found
                    </li>
                </ul>
                <Button
                    variant="muted"
                    className="mt-2 w-full"
                    asChild
                >
                    <Link href={`/workspaces/${workspaceId}/tasks`}>
                        Show All
                    </Link>
                </Button>
            </div>
        </div>
    )
}

interface ProjectListProps{
    data: Project[];
    total: number;
};

export const ProjectList = ({ 
    data,
    total,
}: ProjectListProps) => {

    const { isAdmin } = useCurrentMember();

    const { open: createProject } = useCreateProjectModal();
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold"> 
                        Projects ({total})
                    </p>
                    {isAdmin &&
                    <Button
                        variant="secondry"
                        size="icon"
                        onClick={createProject}
                    >
                        <PlusIcon className="size-4 text-neutral-800" />
                    </Button>
                    }
                </div>
                <Separator className="my-2" />
                
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2"> 
                    {data.map((project) => (
                        <li key={project.$id}>
                            <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                            <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                                <CardContent className="p-2 flex items-center gap-x-2.5">
                                    <ProjectAvatar
                                        name={project.name}
                                        image={project.imageUrl}
                                        className="size-8"
                                        fallbackClassName="text-lg"
                                    />
                                    <p className="text-lg font-medium truncate">
                                        {project.name}
                                    </p>
                                </CardContent>
                            </Card>
                            </Link>
                        </li>
                    ))}

                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        No projects found
                    </li>
                </ul>
            </div>
        </div>
    )
}


interface MembersListProps{
    data: Member[];
    total: number;
};

export const MembersList = ({ 
    data,
    total,
}: MembersListProps) => {

    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    return (

        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold"> 
                        Members ({total})
                    </p>
                    <Button
                        variant="secondry"
                        size="icon"
                        asChild
                    >
                        <Link href={`/workspaces/${workspaceId}/members`}>
                        <SettingsIcon className="size-4 text-neutral-800" />
                        </Link>
                    </Button>
                </div>
                <Separator className="my-2" />
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"> 
                    {data.map((member) => (
                        <li key={member.$id}> 
                            <Card className="shadow-none rounded-lg overflow-hidden">
                                <CardContent className="p-2 flex flex-col items-center gap-x-2">
                                    <MemberAvatar
                                        name={member.name}
                                        className="size-12"
                                    />
                                    <div className="flex flex-col items-center overflow-hidden">
                                        <p className="text-md font-medium line-clamp-2">
                                        {member.name}
                                    </p>

                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {member.email}
                                    </p>

                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {member.role}
                                    </p>
                                    </div>
                                    
                                </CardContent>
                            </Card>
                        </li>
                    ))}

                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        No members found
                    </li>
                </ul>
            </div>
        </div>


    )
}