import { 
    PencilIcon, 
    Trash2Icon, 
    LockKeyhole, 
    ArrowRightCircle 
} from "lucide-react";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OverviewProperty } from "./overview-property";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { TaskDate } from "../../../components/date-indicator";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { ProgressBar } from "@/components/Progress-bar";
import { TaskDescription } from "./task-description"; // ✅ Imported existing component

interface TaskOverviewProps {
    task: Task;
}

export const TaskOverview = ({
    task,
}: TaskOverviewProps) => {

    const { open } = useEditTaskModal();

    return (
        <div className="flex flex-col w-full gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4 border border-border/50">
                {/* --- Header Section --- */}
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold flex items-center gap-2">
                        {task.name}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => open(task.id)}
                            size="sm"
                            variant="outline"
                            className="h-8"
                        >
                            <PencilIcon className="size-4 mr-2" />
                            Edit
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            className="h-8"
                        >
                            <Trash2Icon className="size-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
                
                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="flex flex-col gap-y-4 w-full">
                        
                        {/* <OverviewProperty label="Task Name">
                            <p className="text-sm font-medium text-foreground">{task.name}</p>
                        </OverviewProperty> */}

                        <OverviewProperty label="Assignee">
                            <div className="flex items-center gap-2">
                                <MemberAvatar name={task.assigneeId} className="size-6" fallbackClassname="text-xs" />
                                <p className="text-sm font-medium">{task.assigneeId}</p>
                            </div>
                        </OverviewProperty>

                        <OverviewProperty label="Assigned By">
                            <div className="flex items-center gap-2">
                                <MemberAvatar name={task.assignedById} className="size-6" fallbackClassname="text-xs" />
                                <p className="text-sm font-medium">{task.assignedById}</p>
                            </div>
                        </OverviewProperty>

                        <OverviewProperty label="Project">
                            <div className="flex items-center gap-2">
                                <ProjectAvatar name={task.projectId} className="size-6" fallbackClassName="text-xs" />
                                <p className="text-sm font-medium">{task.projectId}</p>
                            </div>
                        </OverviewProperty>

                        <OverviewProperty label="Segment">
                            <p className="text-sm font-medium">{task.segmentId || "N/A"}</p>
                        </OverviewProperty>

                        <OverviewProperty label="Blocked By">
                                {task.blockedBy ? (
                                    <div className="flex items-center gap-1.5 text-red-600">
                                        <LockKeyhole className="size-3.5" />
                                        <span className="text-sm font-medium truncate max-w-[100px]" title={task.blockedBy}>
                                            {task.blockedBy}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-muted-foreground">-</span>
                                )}
                            </OverviewProperty>

                        <OverviewProperty label="Start Date">
                            <TaskDate className="text-sm font-medium" value={task.startDate} />
                        </OverviewProperty>

                        <OverviewProperty label="Created At">
                            <TaskDate className="text-sm font-medium" value={task.createdAt} />
                        </OverviewProperty>

                    </div>

                    {/* RIGHT COLUMN: Status, Metrics & Dependencies (7 Items) */}
                    <div className="flex flex-col gap-y-4 w-full">
                        
                        <OverviewProperty label="Status">
                            <Badge variant={task.taskStatus}>
                                {snakeCaseToTitleCase(task.taskStatus)}
                            </Badge>
                        </OverviewProperty>

                        <OverviewProperty label="Priority">
                            <Badge variant={task.taskPriority}>
                                {snakeCaseToTitleCase(task.taskPriority)}
                            </Badge>
                        </OverviewProperty>

                        <OverviewProperty label="Effort Points">
                            <Badge variant="outline" className="font-mono text-xs">
                                {task.effortPoints} pts
                            </Badge>
                        </OverviewProperty>

                        <OverviewProperty label="Budget">
                            <p className="text-sm font-medium font-mono text-emerald-600 dark:text-emerald-400">
                                {task.budget > 0 ? `$${task.budget.toLocaleString()}` : "—"}
                            </p>
                        </OverviewProperty>

                        <OverviewProperty label="Blocking">
                                {task.blockingTo ? (
                                    <div className="flex items-center gap-1.5 text-amber-600">
                                        <ArrowRightCircle className="size-3.5" />
                                        <span className="text-sm font-medium truncate max-w-[100px]" title={task.blockingTo}>
                                            {task.blockingTo}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-muted-foreground">-</span>
                                )}
                        </OverviewProperty>


                        <OverviewProperty label="Due Date">
                            <TaskDate className="text-sm font-medium" value={task.endDate} />
                        </OverviewProperty>

                        <OverviewProperty label="Last Updated">
                            <TaskDate className="text-sm font-medium" value={task.updatedAt} />
                        </OverviewProperty>

                    </div>
                </div>

                <Separator className="my-4" />

                {/* --- Progress Bar Section --- */}
                <div className="flex flex-col gap-y-2">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-muted-foreground font-medium">Completion Progress</p>
                        <span className="text-sm font-bold text-muted-foreground">{task.progress}%</span>
                    </div>
                    <ProgressBar value={task.progress} size="lg" className="w-full" />
                </div>

            </div>
        </div>
    );
};