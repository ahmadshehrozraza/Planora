"use client";

import { useState } from "react";
import { PencilIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useUpdateTask } from "../api/use-update-task";
import { useRouter } from "next/navigation";

interface TaskDescriptionProps {
    task: any;
}

export const TaskDescription = ({
    task,
}: TaskDescriptionProps) => {

    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.description || "");
    const router = useRouter();

    const { mutate, isPending } = useUpdateTask();

    const handleSave = () => {
        const payload = {
            id: task.id,
            name: task.name,
            workspaceId: task.workspaceId,
            projectId: task.projectId,
            columnId: task.columnId,
            sprintId: task.sprintId || "",
            assigneeId: task.assigneeId || "",
            taskType: task.taskType,
            priority: task.priority,
            dueDate: task.dueDate,
            startDate: task.startDate,
            budget: task.budget || 0,
            currency: task.currency || "PKR",
            effortPoints: task.effortPoints || 1,
            progress: task.progress || 0,
            blockedById: task.blockedById || "",
            blockingTo: task.blocking?.length > 0 ? task.blocking[0].id : "",
            description: value,
        };

        mutate(payload, {
            onSuccess: () => {
                setIsEditing(false);
                router.refresh();
            }
        });
    }
    
    return(
        <div className="p-4 border border-border rounded-lg w-full bg-card">
            <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-foreground">Description</p>
                <Button
                    onClick={() => setIsEditing((prev) => !prev)}
                    size="sm"
                    variant="secondary"
                    disabled={isPending}
                >
                    {isEditing ? (
                        <XIcon className="size-4 mr-2" />
                    ) : (
                        <PencilIcon className="size-4 mr-2" />
                    )}
                    
                    {isEditing ? "Cancel" : "Edit"}
                </Button>
            </div>
            
            <Separator className="my-3" />
            
            { isEditing ? (
                <div className="flex flex-col gap-y-4">
                    <Textarea
                        placeholder="Add a description..."
                        value={value}
                        rows={4}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={isPending}
                        className="resize-none"
                    />
                    <Button
                        size="sm"
                        className="w-fit ml-auto"
                        onClick={handleSave}
                        disabled={isPending}
                    >
                        {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            ) : (
                <div className="text-sm">
                    {task.description ? (
                        <p className="whitespace-pre-wrap text-foreground">
                            {task.description}
                        </p>
                    ) : (
                        <span className="text-muted-foreground italic">
                            No description set
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}