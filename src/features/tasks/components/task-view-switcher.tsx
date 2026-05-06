"use client";

import { useCallback } from "react";
import { useQueryState } from "nuqs";
import { PlusIcon, Github } from "lucide-react";
import { useParams } from "next/navigation"; 

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useTaskFilters } from "../hooks/use-task-filters";
import { useGetTasks } from "../api/use-get-tasks";
import { useGetEvents } from "@/features/events/api/use-get-events"; 

import { WorkspaceTaskFilters } from "./workspace-task-filters";
import { ProjectTaskFilters } from "./project-task-filters";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DataCalendar } from "./data-calendar";
import { PageLoader } from "@/components/page-loader";
import { DataKanban } from "./data-kanban";
import { DataGantt } from "./data-gantt";

import { useGetProjectColumns } from "@/features/projects/api/use-get-project-columns";
import { useColumnMutations } from "@/features/columns/api/use-columns"; 
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useSSE } from "@/hooks/use-sse";

export const TaskViewSwitcher = () => {
  useSSE();

  const [{ status, assigneeId, projectId: filterProjectId, sprintId: filterSprintId, dueDate, search, tagId }] = useTaskFilters();
  
  const [view, setView] = useQueryState("task-view", { defaultValue: "table" });

  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();

  const { data: permissions } = useGetPermissions( workspaceId, paramProjectId as string );
  const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];
   
  const allowed = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.TASK_CREATE);
  
  const params = useParams();
  const paramSprintId = params.sprintId as string | undefined;

  const { open } = useCreateTaskModal();

  const effectiveProjectId = filterProjectId === "all" ? undefined : (filterProjectId || paramProjectId);
  const effectiveSprintId = filterSprintId === "all" ? "all" : (filterSprintId || paramSprintId);

  const { data: project } = useGetProject({ projectId: effectiveProjectId as string });

  const { data: taskResponse, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    projectId: effectiveProjectId,
    sprintId: effectiveSprintId,
    assigneeId: assigneeId === "all-tasks" ? undefined : assigneeId,
    status: status === "all" ? undefined : status,
    dueDate: dueDate || undefined,
    search: search === "" ? undefined : search,
    tagId: tagId === "all" ? undefined : tagId
  });

  const { data: eventsResponse } = useGetEvents({
    workspaceId,
    projectId: effectiveProjectId
  });

  const tasks = taskResponse || [];
  const events = eventsResponse || [];

  const { data: projectColumns } = useGetProjectColumns(effectiveProjectId);
  const { createColumn, reorderColumns } = useColumnMutations();
  const { mutate: bulkUpdateTasks } = useBulkUpdateTasks();

  const onKanbanChange = useCallback((updatedTasks: { id: string; columnId: string; position: number; }[]) => {
      bulkUpdateTasks(updatedTasks);
  }, [bulkUpdateTasks]);
  
  const onColumnsChange = useCallback((updatedColumns: { id: string; position: number; }[]) => {
      if (!effectiveProjectId) return;
      if (reorderColumns) {
          reorderColumns.mutate({ 
              columns: updatedColumns, 
              projectId: effectiveProjectId 
          });
      }
  }, [reorderColumns, effectiveProjectId]);

  const handleCreateColumn = useCallback((name: string) => {
      if (effectiveProjectId && workspaceId) {
          createColumn.mutate({ 
              projectId: effectiveProjectId, 
              name, 
              workspaceId 
          });
      }
  }, [effectiveProjectId, workspaceId, createColumn]);

  return (
    <Tabs defaultValue={view} onValueChange={setView} className="flex-1 w-full border-none">
      <div className="h-full flex flex-col overflow-auto border-none">
        <div className="flex flex-col gap-y-4 lg:flex-row justify-between items-center mb-4 border-none">
          <div className="flex items-center gap-4 w-full lg:w-auto">
              <TabsList className="h-11 w-full lg:w-auto bg-muted/60 p-1 rounded-xl border border-border/50">
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
                <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>

              {project?.githubRepoUrl && (
                  <Button asChild variant="outline" size="sm" className="h-10 shadow-sm hidden lg:flex">
                      <a href={project.githubRepoUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="size-4 mr-1" />
                          Repository
                      </a>
                  </Button>
              )}
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
              {project?.githubRepoUrl && (
                  <Button asChild variant="outline" size="sm" className="h-11 shadow-sm w-full lg:hidden">
                      <a href={project.githubRepoUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="size-4 mr-2" />
                          Repository
                      </a>
                  </Button>
              )}
              
            {allowed && (
              <Button onClick={open} size="sm" className="w-full lg:w-auto h-11 shadow-sm">
                <PlusIcon className="size-4 mr-2" />
                New Task
              </Button>
            )}
          </div>
        </div>

        <div className="mb-4">
           {paramProjectId ? <ProjectTaskFilters /> : <WorkspaceTaskFilters />}
        </div>
        
        {isLoadingTasks ? (
           <div className="w-full h-[200px] flex items-center justify-center border border-border bg-card rounded-lg shadow-sm">
                <PageLoader />
           </div>
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
               <div className=" bg-card rounded-lg overflow-hidden shadow-sm">
                  <DataTable columns={columns} data={tasks} />
               </div>
            </TabsContent>

            <TabsContent value="kanban" className="mt-0">
               <div className="border border-border rounded-lg p-4 min-h-[500px] bg-card shadow-sm">
                  {effectiveProjectId && projectColumns ? (
                     <DataKanban 
                        tasks={tasks} 
                        columns={projectColumns} 
                        onChangeTasks={onKanbanChange} 
                        onChangeColumns={onColumnsChange} 
                        onCreateColumn={handleCreateColumn}
                     />
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
                        Please select a project to view the Kanban board.
                     </div>
                  )}
               </div>
            </TabsContent>

            <TabsContent value="gantt" className="mt-0">
                <div className="border border-border rounded-lg bg-card shadow-sm min-h-[400px]">
                  {effectiveProjectId ? (
                     <DataGantt tasks={tasks} events={events} />
                  ) : (
                     <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground text-sm">
                        Gantt chart is only available at the Project level. <br/> Please select a project from the filters above.
                     </div>
                  )}
               </div>
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
               <div className="border border-border rounded-lg p-4 h-full bg-card shadow-sm">
                  <DataCalendar data={tasks} />
               </div>
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};