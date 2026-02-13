"use client";

import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useQueryState } from "nuqs";
import { Separator } from "@/components/ui/separator";
import { Loader, PlusIcon } from "lucide-react";
import { useGetTasks } from "../api/use-get-tasks";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DataFilters } from "./data-filters";
import { useTaskFilters } from "../hooks/use-task-filters";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DataKanban } from "./data-kanban";
import { useCallback } from "react";
import { TaskStatus } from "../types";
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";
import { DataCalendar } from "./data-calendar";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetTasksByProject } from "../api/use-get-dummy-tasks";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/page-loader";

export const TaskViewSwitcher = () => {
    const [{
        status,
        assigneeId,
        projectId,
        dueDate,
    }] = useTaskFilters();

    const [view, setView] = useQueryState("task-view", {
        defaultValue: "table",
    })

    const workspaceId = useWorkspaceId();
    const paramProjectId = useProjectId();

    const { open } = useCreateTaskModal();
    const { mutate: bulkUpdate } = useBulkUpdateTasks();

    const {
        data: tasks,
        isLoading: isLoadingTasks
    } = useGetTasksByProject(projectId);

    // const onKanbanChange = useCallback((
    //     tasks: { $id: string; status: TaskStatus; position: number }[]
    // ) => {
    //     bulkUpdate({
    //         json: { tasks },
    //     })
    // }, [bulkUpdate]);

    return (
        <Card className="w-full border-none">
            <Tabs
                defaultValue={view}
                onValueChange={setView}
                className="w-full border-none"
            >
                <div className="border-none">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-none">
                        <TabsList className="w-full md:w-auto ">
                            <TabsTrigger value="table" className="flex-1 md:flex-none mr-2">
                                Table
                            </TabsTrigger>
                            <TabsTrigger value="kanban" className="flex-1 md:flex-none mr-2">
                                Kanban
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="flex-1 md:flex-none">
                                Calendar
                            </TabsTrigger>
                        </TabsList>

                        <Button
                            onClick={open}
                            size={"sm"}
                            className="w-full md:w-auto">
                            <PlusIcon className="size-4 mr-2" />
                            New Task
                        </Button>
                    </div>

                    <div className="mb-6">
                        <DataFilters />
                    </div>

                    {isLoadingTasks ? (
                        <PageLoader />
                    ) : (
                        <>
                            <TabsContent value="table" className="mt-0 border-none">
                                <div className="border-none">
                                    <DataTable
                                        columns={columns}
                                        data={tasks?.documents ?? []}
                                    />
                                </div>
                            </TabsContent>


                            <TabsContent value="kanban" className="mt-0">
                                <div className="border rounded-lg p-4">
                                    <p className="text-center text-muted-foreground py-8">
                                        Kanban view coming soon...
                                    </p>
                                    {/* <DataKanban onChange={onKanbanChange} data={tasks?.documents ?? []} /> */}
                                </div>
                            </TabsContent>

                            <TabsContent value="calendar" className="mt-0">
                                <div className="border rounded-lg p-4">
                                    <DataCalendar data={tasks?.documents ?? []} />
                                </div>
                            </TabsContent>
                        </>
                    )}
                </div>
            </Tabs>
        </Card>
    );
};