"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema } from "../schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { TaskType, TaskPriority } from "../types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useState, useEffect, useRef, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CurrencySelector } from "@/components/currency-selector";
import { useCreateTask } from "../api/use-create-task";
import { useGetProjectColumns } from "@/features/projects/api/use-get-project-columns";
import { useGetSegments } from "@/features/segments/api/use-get-segments";
import { useGetTasks } from "../api/use-get-tasks";
import { useGetProjectMembers } from "@/features/members/api/use-get-project-members"; 
import { PageLoader } from "@/components/page-loader";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";

interface CreateTaskFormProps {
  onCancel?: () => void;
  projectOptions: { id: string, name: string, imageUrl: string }[];
};

export const CreateTaskForm = ({
  onCancel,
  projectOptions,
}: CreateTaskFormProps) => {
  const workspaceId = useWorkspaceId();
  const prevProjectId = useRef<string>("");
  
  const [isNewColumn, setIsNewColumn] = useState(false);

  const { mutate, isPending } = useCreateTask();

  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      name: "",
      workspaceId: workspaceId || "",
      projectId: "",
      segmentId: "",
      columnId: "",
      newColumnName: "",
      dueDate: new Date(),
      assigneeId: "",
      description: "",
      taskType: TaskType.TASK,
      priority: TaskPriority.LOW,
      budget: 0,
      effortPoints: 1,
      startDate: new Date(),
      blockedById: "",
      blockingTo: "",
      currency: "PKR",
    },
  });

  const watchProjectId = form.watch("projectId");
  const watchBlockedById = form.watch("blockedById");
  const watchBlockingTo = form.watch("blockingTo");
  const watchStartDate = form.watch("startDate");

  const { data: projectPerms, isLoading: isLoadingPerms } = useGetPermissions(workspaceId, watchProjectId);
  const canManageSelectedProject = projectPerms?.canManageProject ?? false;
  
  const { data: columns, isLoading: isLoadingColumns } = useGetProjectColumns(watchProjectId);
  const { data: segments, isLoading: isLoadingSegments } = useGetSegments(watchProjectId);
  const { data: tasksResponse, isLoading: isLoadingTasks } = useGetTasks({
      workspaceId: workspaceId,
      projectId: watchProjectId
  });
  
  const { data: membersData, isLoading: isLoadingMembers } = useGetProjectMembers(watchProjectId);

  const tasks = tasksResponse || [];
  
  const memberOptions = useMemo(() => {
    return membersData?.data?.map((m: any) => ({
      id: m.userId, 
      name: m.name,
      userId: m.userId,
      image: m.image
    })) || [];
  }, [membersData]);

  useEffect(() => {
    if (watchProjectId && watchProjectId !== prevProjectId.current) {
      form.setValue("segmentId", "");
      form.setValue("columnId", "");
      form.setValue("newColumnName", "");
      form.setValue("blockedById", "");
      form.setValue("blockingTo", "");
      form.setValue("assigneeId", ""); 
      prevProjectId.current = watchProjectId;
      
      if (columns?.length === 0) {
        setIsNewColumn(true);
      }
    }
  }, [watchProjectId, columns, form]);

  useEffect(() => {
      if (columns && columns.length > 0 && !form.getValues("columnId") && !isNewColumn) {
          form.setValue("columnId", columns[0].id);
      }
  }, [columns, form, isNewColumn]);

  useEffect(() => {
      const currentDueDate = form.getValues("dueDate");
      if (watchStartDate && currentDueDate) {
          const start = new Date(watchStartDate);
          start.setHours(0, 0, 0, 0);
          const due = new Date(currentDueDate);
          due.setHours(0, 0, 0, 0);

          if (start > due) {
              form.setValue("dueDate", watchStartDate);
          }
      }
  }, [watchStartDate, form]);

  const validateCircularDependency = () => {
    const blockedById = form.getValues("blockedById");
    const blockingTo = form.getValues("blockingTo");

    if (blockedById && blockedById !== "no-blocked-by" &&
        blockingTo && blockingTo !== "no-blocking-to" &&
        blockedById === blockingTo) {
        form.setError("blockingTo", {
            type: "manual",
            message: "A task cannot block itself"
        });
        return false;
    }
    return true;
  };

  const onSubmit = (values: z.infer<typeof createTaskSchema>) => {
    
    if (watchProjectId && !canManageSelectedProject) {
        form.setError("projectId", { type: "manual", message: "You don't have manager permissions for this project." });
        return;
    }

    if (!isNewColumn && (!values.columnId || values.columnId === "")) {
        form.setError("columnId", { type: "manual", message: "Status column is required" });
        return;
    }

    if (isNewColumn && (!values.newColumnName || values.newColumnName.trim() === "")) {
        form.setError("newColumnName", { type: "manual", message: "Column name is required" });
        return;
    }

    const startVal = new Date(values.startDate);
    startVal.setHours(0, 0, 0, 0);
    const dueVal = new Date(values.dueDate);
    dueVal.setHours(0, 0, 0, 0);

    if (dueVal < startVal) {
        form.setError("dueDate", { 
            type: "manual", 
            message: "Due date cannot be before Start date" 
        });
        return;
    }

    if (!validateCircularDependency()) return;

    const payload = { ...values };
    
    if (isNewColumn) {
        payload.columnId = undefined;
    } else {
        payload.newColumnName = undefined;
    }

    if (payload.blockedById === "no-blocked-by") payload.blockedById = "";
    if (payload.blockingTo === "no-blocking-to") payload.blockingTo = "";
    if (payload.assigneeId === "no-assignee") payload.assigneeId = "";
    if (payload.segmentId === "no-segment") payload.segmentId = "";

    mutate(payload, {
        onSuccess: (data) => {
            if(data?.success) {
                form.reset();
                onCancel?.();
            }
        }
    });
  };

  if (!workspaceId) return null;

  const isSubmissionDisabled = isPending || (!!watchProjectId && !canManageSelectedProject && !isLoadingPerms);

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-2">
        <CardTitle className="text-xl font-bold">
          Create a new Task
        </CardTitle>
      </CardHeader>

      <div className="px-3">
        <Separator />
      </div>

      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter task name" className="h-11" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project * {isLoadingPerms && <PageLoader />}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger className={cn("h-11", (!canManageSelectedProject && watchProjectId && !isLoadingPerms) && "border-destructive/80 bg-destructive/10")}>
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectOptions.length > 0 ? (
                        projectOptions.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center gap-x-2">
                              <ProjectAvatar className="size-6" name={project.name} image={project.imageUrl} />
                              <span>{project.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-projects" disabled>No projects available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  {(!canManageSelectedProject && watchProjectId && !isLoadingPerms) && (
                      <p className="text-[12px] text-destructive font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="size-3" /> You are not a manager in this project.
                      </p>
                  )}
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchProjectId && (
              <FormField
                control={form.control}
                name="segmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Segment (Optional) {isLoadingSegments && <PageLoader />}
                    </FormLabel>
                    <Select
                      value={field.value || "no-segment"}
                      onValueChange={(val) => field.onChange(val === "no-segment" ? "" : val)}
                      disabled={isLoadingSegments || isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          {isLoadingSegments ? (
                            <div className="flex items-center gap-2"><PageLoader /><span>Loading...</span></div>
                          ) : (
                            <SelectValue placeholder="Select Segment" />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no-segment"><span className="text-muted-foreground">No Segment</span></SelectItem>
                        {segments?.map((segment: any) => (
                          <SelectItem key={segment.id} value={segment.id}>{segment.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DatePicker {...field} placeholder="Select start date" className="h-11" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date *</FormLabel>
                    <FormControl>
                      <DatePicker {...field} placeholder="Select due date" className="h-11" disabled={isPending} fromDate={watchStartDate} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="effortPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effort Points (1-10)</FormLabel>
                  <Select value={field.value?.toString() || "1"} onValueChange={(val) => field.onChange(parseInt(val))} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select effort points" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((point) => (
                        <SelectItem key={point} value={point.toString()}>{point} point{point !== 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchProjectId && tasks && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="blockedById"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">Blocked By {isLoadingTasks && <PageLoader />}</FormLabel>
                        <Select
                          value={field.value || "no-blocked-by"}
                          onValueChange={(val) => field.onChange(val === "no-blocked-by" ? "" : val)}
                          disabled={isLoadingTasks || isPending}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              {isLoadingTasks ? <span className="text-muted-foreground">Loading tasks...</span> : <SelectValue placeholder="Select blocking task" />}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no-blocked-by"><span className="text-muted-foreground">Not blocked</span></SelectItem>
                            {tasks.map((task: any) => (
                              <SelectItem key={task.id} value={task.id}>
                                <span className="truncate">{task.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="blockingTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">Blocking To {isLoadingTasks && <PageLoader />}</FormLabel>
                        <Select
                          value={field.value || "no-blocking-to"}
                          onValueChange={(val) => field.onChange(val === "no-blocking-to" ? "" : val)}
                          disabled={isLoadingTasks || isPending}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              {isLoadingTasks ? <span className="text-muted-foreground">Loading tasks...</span> : <SelectValue placeholder="Select task that this blocks" />}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no-blocking-to"><span className="text-muted-foreground">Not blocking</span></SelectItem>
                            {tasks.map((task: any) => (
                              <SelectItem key={task.id} value={task.id}>
                                <span className="truncate">{task.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {(watchBlockedById && watchBlockedById !== "no-blocked-by" &&
                  watchBlockingTo && watchBlockingTo !== "no-blocking-to" &&
                  watchBlockedById === watchBlockingTo) && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Circular dependency detected! A task cannot block itself.
                      </AlertDescription>
                    </Alert>
                  )}
              </div>
            )}

            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Assignee (Optional) {isLoadingMembers && <PageLoader />}
                  </FormLabel>
                  <Select value={field.value || "no-assignee"} onValueChange={(val) => field.onChange(val === "no-assignee" ? "" : val)} disabled={isPending || isLoadingMembers || !watchProjectId}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        {isLoadingMembers ? (
                          <span className="text-muted-foreground">Loading members...</span>
                        ) : !watchProjectId ? (
                          <span className="text-muted-foreground">Select a project first</span>
                        ) : (
                          <SelectValue placeholder="Select Assignee" />
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-assignee"><span className="text-muted-foreground">No Assignee</span></SelectItem>
                      {memberOptions.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-x-2">
                            <MemberAvatar 
                              className="size-6" 
                              name={member.name} 
                              src={member.image}
                              />
                            <span>{member.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between mt-1">
                    <FormLabel>Status Column * {isLoadingColumns && <PageLoader />}</FormLabel>
                    <button
                        type="button"
                        onClick={() => {
                            setIsNewColumn(!isNewColumn);
                            form.setValue("columnId", "");
                            form.setValue("newColumnName", "");
                            form.clearErrors(["columnId", "newColumnName"]);
                        }}
                        className="text-[10px] text-primary hover:underline font-semibold"
                        disabled={isPending || (!columns?.length && !isNewColumn)}
                    >
                        {isNewColumn ? "Select Existing" : "+ Add New Column"}
                    </button>
                </div>
                
                {isNewColumn ? (
                    <FormField
                        control={form.control}
                        name="newColumnName"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input {...field} placeholder="e.g. In QA" className="h-11" disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : (
                    <FormField
                        control={form.control}
                        name="columnId"
                        render={({ field }) => (
                            <FormItem>
                                <Select value={field.value} onValueChange={field.onChange} disabled={isLoadingColumns || !watchProjectId || isPending}>
                                    <FormControl>
                                        <SelectTrigger className="h-11"><SelectValue placeholder="Select Column" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {columns?.map((col: any) => (
                                            <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
              </div>

              <FormField
                control={form.control}
                name="taskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value={TaskType.TASK}>Task</SelectItem>
                        <SelectItem value={TaskType.FEATURE}>Feature</SelectItem>
                        <SelectItem value={TaskType.DOCUMENTATION}>Documentation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Priority" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                        <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                        <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 items-end">
              <div className="col-span-1">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Currency</FormLabel>
                      <FormControl><CurrencySelector value={field.value || "PKR"} onValueChange={field.onChange} className="h-10" disabled={isPending} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Cost Amount</FormLabel>
                      <FormControl><Input {...field} 
                      type="number" 
                      min="0" 
                      // step="1000" 
                      placeholder="0.00" 
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)} value={field.value || ""} className="h-10" disabled={isPending} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Describe the task details, requirements, and objectives..." className="min-h-[100px] resize-none" disabled={isPending} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <Button type="button" variant="outline" onClick={onCancel} className={cn(!onCancel && "invisible")} disabled={isPending}>Cancel</Button>

                <Button type="submit" size="lg" disabled={isSubmissionDisabled}>
                    {isPending ? <><PageLoader /> Creating...</> : "Create Task"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};