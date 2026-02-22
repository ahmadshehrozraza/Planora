"use client";

import { useCallback } from "react";
import { useQueryState } from "nuqs";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useTaskFilters } from "../hooks/use-task-filters";
import { useGetTasks } from "../api/use-get-dummy-tasks";

import { DataFilters } from "./data-filters";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DataCalendar } from "./data-calendar";
import { PageLoader } from "@/components/page-loader";
import { DataKanban } from "./data-kanban";
import { TaskStatus } from "../types";

export const TaskViewSwitcher = () => {
  const [{ status, assigneeId, projectId: filterProjectId, segmentId, dueDate }] = useTaskFilters();
  
  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });

  const workspaceId = useWorkspaceId();
  const urlProjectId = useProjectId();
  const { open } = useCreateTaskModal();

  const effectiveProjectId = urlProjectId || filterProjectId;

  const validStatus = status === "all" ? undefined : (status as TaskStatus);
  const validAssigneeId = assigneeId === "all-tasks" ? undefined : assigneeId;
  const validProjectId = effectiveProjectId === "all" ? undefined : effectiveProjectId;
  const validSegmentId = segmentId === "all" ? undefined : segmentId;
  const validDueDate = dueDate ? new Date(dueDate) : undefined;

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    projectId: validProjectId,
    segmentId: validSegmentId,
    assigneeId: validAssigneeId,
    status: validStatus,
    dueDate: validDueDate,
  });

  const onKanbanChange = useCallback((updatedTasks: { id: string; status: TaskStatus; position: number; }[]) => {
     console.log("Kanban tasks updated:", updatedTasks);
  }, []);

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="flex-1 w-full border-none"
    >
      <div className="h-full flex flex-col overflow-auto border-none">
        <div className="flex flex-col gap-y-4 lg:flex-row justify-between items-center mb-4 border-none">
          <TabsList className="w-full lg:w-auto bg-muted/50 border-none">
            <TabsTrigger value="table" className="h-8 w-full lg:w-auto ml-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Table</TabsTrigger>
            <TabsTrigger value="kanban" className="h-8 w-full lg:w-auto ml-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Kanban</TabsTrigger>
            <TabsTrigger value="calendar" className="h-8 w-full lg:w-auto ml-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Calendar</TabsTrigger>
          </TabsList>

          <Button onClick={open} size="sm" className="w-full lg:w-auto shadow-sm">
            <PlusIcon className="size-4 mr-2" />
            New Task
          </Button>
        </div>

        <div className="mb-4">
           <DataFilters />
        </div>
        
        {isLoadingTasks ? (
           <div className="w-full h-[200px] flex items-center justify-center border border-border bg-card rounded-lg">
                <PageLoader />
           </div>
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
               <div className="border-none border-border bg-card rounded-lg overflow-hidden shadow-sm">
                  <DataTable columns={columns} data={tasks?.documents ?? []} />
               </div>
            </TabsContent>

            <TabsContent value="kanban" className="mt-0">
               <div className="border border-border rounded-lg p-4 min-h-[500px] bg-card shadow-sm">
                  <DataKanban data={tasks?.documents ?? []} onChange={onKanbanChange} />
               </div>
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
               <div className="border border-border rounded-lg p-4 h-full bg-card shadow-sm">
                  <DataCalendar data={tasks?.documents ?? []} />
               </div>
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};