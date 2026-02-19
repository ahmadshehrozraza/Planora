"use client";

import { useCallback } from "react";
import { useQueryState } from "nuqs";
import { Loader, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useTaskFilters } from "../hooks/use-task-filters";
import { useGetTasksByProject } from "../api/use-get-dummy-tasks"; // Update path if needed

import { DataFilters } from "./data-filters";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DataCalendar } from "./data-calendar";
import { PageLoader } from "@/components/page-loader";
import { Separator } from "@/components/ui/separator";
import { KanbanCard } from "./kanban-card";

export const TaskViewSwitcher = () => {

  const [{ status, assigneeId, projectId, dueDate }] = useTaskFilters();
  
  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });

  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  const { open } = useCreateTaskModal();

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasksByProject(projectId);

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="flex-1 w-full border-none"
    >
      <div className="h-full flex flex-col overflow-auto">

        <div className="flex flex-col gap-y-4 lg:flex-row justify-between items-center mb-4">
          
          <TabsList className="w-full lg:w-auto ">
            <TabsTrigger value="table" className="h-8 w-full lg:w-auto ml-2">Table</TabsTrigger>
            <TabsTrigger value="kanban" className="h-8 w-full lg:w-auto ml-2">Kanban</TabsTrigger>
            <TabsTrigger value="calendar" className="h-8 w-full lg:w-auto ml-2">Calendar</TabsTrigger>
          </TabsList>

          <Button onClick={open} size="sm" className="w-full lg:w-auto">
            <PlusIcon className="size-4 mr-2" />
            New Task
          </Button>
        </div>

        <div className="mb-4">
           <DataFilters />
        </div>
        
        {isLoadingTasks ? (
           <div className="w-full h-[200px] flex items-center justify-center border rounded-lg">
              {/* <Loader className="size-6 animate-spin text-muted-foreground" /> */}
                <PageLoader />
           </div>
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
               <div className="border rounded-lg overflow-hidden">
                  <DataTable 
                    columns={columns} 
                    data={tasks?.documents ?? []} 
                  />
               </div>
            </TabsContent>

            <TabsContent value="kanban" className="mt-0">
                {/* <KanbanCard tasks={tasks?.documents ?? []} /> */}
               <div className="border rounded-lg p-4 h-[500px] flex items-center justify-center bg-muted/10">
                  <p className="text-muted-foreground">Kanban view coming soon...</p>
               </div>
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
               <div className="border rounded-lg p-4 h-full">
                  <DataCalendar data={tasks?.documents ?? []} />
               </div>
            </TabsContent>
          </>
        )}

      </div>
    </Tabs>
  );
};