import { PencilIcon } from "lucide-react";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@radix-ui/react-separator";
import { OverviewProperty } from "./overview-property";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { TaskDate } from "./task-date";
import { snakeCaseToTitleCase, toNumber } from "@/lib/utils";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { Progress } from "@/components/ui/progress";

interface TaskOverviewProps {
    task: Task;
}

export const TaskOverview = ({
    task,
}: TaskOverviewProps) => {

    const { open } = useEditTaskModal();

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">Overview</p>
                    <Button
                        onClick={() => open(task.$id)}
                        size="sm"
                        variant="secondry"
                    >
                        <PencilIcon className="size-4 mr-2" />
                        Edit
                    </Button>
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-y-4">
                        <OverviewProperty label="Assignee">

                            <div className="flex items-center gap-2">
                                <MemberAvatar
                                    name={task.assignee?.name}
                                    className="size-8"
                                    fallbackClassname="text-md"
                                    
                                />
                                <p className="text-sm font-medium">{task.assignee?.name || "No Assignee"}</p>
                            </div>
                        </OverviewProperty>

                        <OverviewProperty label="Due Date">
                            <TaskDate className="text-sm font-medium" value={task.dueDate} />
                        </OverviewProperty>

                        <OverviewProperty label="Status">
                            <Badge variant={task.status}>
                                {snakeCaseToTitleCase(task.status)}
                            </Badge>
                        </OverviewProperty>

                        <OverviewProperty label="Priority">
                            <Badge variant={task.priority}>
                                {snakeCaseToTitleCase(task.priority)}
                            </Badge>
                        </OverviewProperty>
                    </div>

                    <div className="flex flex-col gap-y-4">
                        <OverviewProperty label="Task Type">
                            <Badge variant={task.taskType}>
                                {snakeCaseToTitleCase(task.taskType)}
                            </Badge>
                        </OverviewProperty>

                        <OverviewProperty label="Assigned By">
                                <div className="flex items-center gap-2">
                                    <MemberAvatar
                                        name={task.assignedByUser.name}
                                        className="size-8"
                                        fallbackClassname="text-md"
                                    />
                                    <p className="text-sm font-medium">{task.assignedByUser.name}</p>
                                </div>
                           
                        </OverviewProperty>

                        <OverviewProperty label="Project">
                                <div className="flex items-center gap-2">
                                    <ProjectAvatar
                                        name={task.project.name}
                                        image={task.project.imageUrl}
                                        className="size-6"
                                        fallbackClassName="text-xs"
                                    />
                                    <p className="text-sm font-medium">{task.project.name}</p>
                                </div>
                           
                        </OverviewProperty>

                        <OverviewProperty label="Created">
                            <TaskDate className="text-sm font-medium" value={task.$createdAt} />
                        </OverviewProperty>

                        <OverviewProperty label="Last Updated">
                            <TaskDate className="text-sm font-medium" value={task.$updatedAt} />
                        </OverviewProperty>
                    </div>
                </div>
            </div>
        </div>
    );
};