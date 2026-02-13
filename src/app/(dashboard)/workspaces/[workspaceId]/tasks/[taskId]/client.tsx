"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetTask } from "@/features/tasks/api/use-get-dummy-tasks";
import { TaskBreadCrumbs } from "@/features/tasks/components/task-breadcrumbs";
import { TaskComments } from "@/features/tasks/components/task-comments";
import { TaskDescription } from "@/features/tasks/components/task-description";
import { TaskOverview } from "@/features/tasks/components/task-overview";
import { useTaskId } from "@/features/tasks/hooks/use-task-id";
import { Separator } from "@radix-ui/react-separator";

export const TaskIdClient = () => {
    const taskId = useTaskId();
    const { data, isLoading } = useGetTask(taskId );

    if(isLoading){
        return <PageLoader />
    }

    if(!data){
        return <PageError message="Task not found" />
    }

    return (
        <div className="w-full flex flex-col gap-2">
            {/* <TaskBreadCrumbs project={data} task={data} /> */}
            {/* <Separator className="my-2" /> */}

            <div className="flex flex-col gap-y-4">
                <TaskOverview task={data} />
                <TaskDescription task={data} />
                <TaskComments task={data} />
            </div>
        </div>
    )
}