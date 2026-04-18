"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editTaskSchema } from "../schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { Task, TaskPriority, TaskType } from "../types";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useUpdateTask } from "../api/use-update-task";
import { Textarea } from "@/components/ui/textarea";
import { CurrencySelector } from "@/components/currency-selector";
import { AlertCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageLoader } from "@/components/page-loader";
import { useGetTasks } from "../api/use-get-tasks";
import { useGetProjectColumns } from "@/features/projects/api/use-get-project-columns";
import { useGetProjectMembers } from "@/features/members/api/use-get-project-members";
import { useGetSegments } from "@/features/segments/api/use-get-segments";
import { useRouter, useParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";

interface EditTaskFormProps {
  onCancel?: () => void;
  initialValues: any;
}

const extractId = (val: any): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val.$id || val.id || "";
};

const safeArray = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.data && Array.isArray(data.data)) return data.data;
  return [];
};

export const EditTaskForm = ({
  onCancel,
  initialValues,
}: EditTaskFormProps) => {
  const router = useRouter();
  const params = useParams();
  const urlWorkspaceId = useWorkspaceId();
  const urlProjectId = params.projectId as string;

  const activeProjectId = extractId(initialValues.projectId) || urlProjectId;
  const activeWorkspaceId = urlWorkspaceId || extractId(initialValues.workspaceId);

  const { data: permissions } = useGetPermissions(activeWorkspaceId, activeProjectId);
  const allowed = (permissions?.workspaceAdmin || permissions?.projectManager) ?? false;

  const [isNewColumn, setIsNewColumn] = useState(false);
  
  const { mutate: updateTask, isPending } = useUpdateTask();

  const form = useForm<z.infer<typeof editTaskSchema>>({
    resolver: zodResolver(editTaskSchema) as any,
    defaultValues: {
      name: initialValues.name || "",
      workspaceId: activeWorkspaceId,
      projectId: activeProjectId,
      columnId: extractId(initialValues.columnId),
      newColumnName: "",
      dueDate: initialValues.dueDate ? new Date(initialValues.dueDate) : new Date(),
      startDate: initialValues.startDate ? new Date(initialValues.startDate) : undefined,
      assigneeId: extractId(initialValues.assigneeId) || "no-assignee",
      segmentId: extractId(initialValues.segmentId) || "no-segment",
      budget: initialValues.budget || 0,
      priority: initialValues.priority || TaskPriority.LOW,
      effortPoints: initialValues.effortPoints || 1,
      progress: initialValues.progress || 0,
      description: initialValues.description || "",
      taskType: initialValues.taskType || TaskType.TASK,
      currency: initialValues.currency || "PKR",
      blockedById: extractId(initialValues.blockedById) || "no-blocked-by",
      blockingTo: initialValues.blocking?.length > 0 ? extractId(initialValues.blocking[0]) : "no-blocking-to",
    },
  });

  const watchBlockedById = form.watch("blockedById");
  const watchBlockingTo = form.watch("blockingTo");

  const { data: columnsData, isLoading: isLoadingColumns } = useGetProjectColumns(activeProjectId);
  const { data: tasksData, isLoading: isLoadingTasks } = useGetTasks({
      workspaceId: activeWorkspaceId,
      projectId: activeProjectId
  });
  const { data: membersData, isLoading: isLoadingMembers } = useGetProjectMembers(activeProjectId);
  const { data: segmentsData, isLoading: isLoadingSegments } = useGetSegments(activeProjectId);

  const columns = useMemo(() => {
    const fetched = safeArray(columnsData);
    const initialCol = initialValues.column ? { id: extractId(initialValues.column), name: initialValues.column.name } : null;

    if (fetched.length > 0) {
      const exists = fetched.some((c: any) => extractId(c) === initialCol?.id);
      if (!exists && initialCol) {
        return [...fetched, initialCol];
      }
      return fetched;
    }

    if (initialCol) return [initialCol];
    return [];
  }, [columnsData, initialValues]);

  const tasks = useMemo(() => {
    const fetched = safeArray(tasksData)
        .filter((t: any) => extractId(t) !== extractId(initialValues))
        .map((t: any) => ({ id: extractId(t), name: t.name }));
    if (fetched.length > 0) return fetched;
    const fallback = [];
    if (initialValues.blockedBy) fallback.push({ id: extractId(initialValues.blockedBy), name: initialValues.blockedBy.name });
    if (initialValues.blocking?.length > 0) {
        initialValues.blocking.forEach((b: any) => fallback.push({ id: extractId(b), name: b.name }));
    }
    return fallback;
  }, [tasksData, initialValues]);

  const memberOptions = useMemo(() => {
    const fetched = safeArray(membersData).map((m: any) => ({
      id: extractId(m.userId) || extractId(m),
      name: m.name || m.user?.name || "Unknown",
      image: m.image || m.user?.image
    }));
    if (fetched.length > 0) return fetched;
    if (initialValues.assignee) return [{ id: extractId(initialValues.assignee), name: initialValues.assignee.name, image: initialValues.assignee?.image }];
    return [];
  }, [membersData, initialValues]);

  const segmentOptions = useMemo(() => {
    const fetched = safeArray(segmentsData).map((s: any) => ({
      id: extractId(s),
      name: s.name || "Unnamed",
    }));
    if (fetched.length > 0) return fetched;
    if (initialValues.segment) return [{ id: extractId(initialValues.segment), name: initialValues.segment.name }];
    return [];
  }, [segmentsData, initialValues]);

  const isSegmentsLoading = isLoadingSegments && segmentOptions.length === 0;
  const isMembersLoading = isLoadingMembers && memberOptions.length === 0;
  const isColumnsLoading = isLoadingColumns && columns.length === 0;
  const isTasksLoading = isLoadingTasks && tasks.length === 0;

  const showNewColumnInput = isNewColumn || (!isColumnsLoading && columns.length === 0);

  useEffect(() => {
    if (!isLoadingColumns && columns.length === 0) {
        setIsNewColumn(true);
    }
  }, [columns.length, isLoadingColumns]);

  const validateCircularDependency = () => {
    const blockedById = form.getValues("blockedById");
    const blockingTo = form.getValues("blockingTo");

    if (blockedById && blockedById !== "no-blocked-by" &&
      blockingTo && blockingTo !== "no-blocking-to" &&
      blockedById === blockingTo) {
      form.setError("blockingTo", { type: "manual", message: "A task cannot block itself" });
      return false;
    }
    return true;
  };

  const onSubmit = (values: z.infer<typeof editTaskSchema>) => {
    if (!showNewColumnInput && (!values.columnId || values.columnId === "")) {
        form.setError("columnId", { type: "manual", message: "Status column is required" });
        return;
    }

    if (showNewColumnInput && (!values.newColumnName || values.newColumnName.trim() === "")) {
        form.setError("newColumnName", { type: "manual", message: "Column name is required" });
        return;
    }

    if (!validateCircularDependency()) return;

    const payload = { 
        ...values,
        id: extractId(initialValues) 
    };
    
    if (showNewColumnInput) {
        payload.columnId = undefined;
    } else {
        payload.newColumnName = undefined;
    }

    if (payload.blockedById === "no-blocked-by") payload.blockedById = "";
    if (payload.blockingTo === "no-blocking-to") payload.blockingTo = "";
    if (payload.assigneeId === "no-assignee") payload.assigneeId = "";
    if (payload.segmentId === "no-segment") payload.segmentId = "";

    updateTask(payload, {
        onSuccess: (data) => {
            if(data?.success) {
                form.reset();
                onCancel?.();
                router.refresh(); 
            }
        }
    });
  };

  if (!activeWorkspaceId) return null;

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-2">
        <CardTitle className="text-xl font-bold">Edit Task</CardTitle>
      </CardHeader>

      <div className="px-3">
        <Separator />
      </div>

      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter task name" className="h-11" disabled={isPending || !allowed} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="segmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-2 items-center">
                    Segment (Optional)
                  </FormLabel>
                  <Select
                    value={field.value || "no-segment"}
                    onValueChange={field.onChange}
                    disabled={isPending || !allowed} 
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select Segment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-segment">
                        <div className="flex items-center gap-x-2 text-muted-foreground">No Segment</div>
                      </SelectItem>
                      {isSegmentsLoading ? (
                        <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">Loading segments...</div>
                      ) : (
                        <>
                          {segmentOptions.map((segment: any) => (
                            <SelectItem key={segment.id} value={segment.id}>
                              <div className="flex items-center gap-x-2">
                                <span>{segment.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                          {segmentOptions.length === 0 && (
                            <SelectItem value="no-segments-available" disabled>
                              No segments available for this project
                            </SelectItem>
                          )}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DatePicker {...field} placeholder="Select start date" className="h-11" disabled={isPending || !allowed} />
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
                      <DatePicker {...field} placeholder="Select due date" className="h-11" disabled={isPending || !allowed} />
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
                  <Select
                    value={field.value?.toString() || "1"}
                    onValueChange={(val) => field.onChange(parseInt(val))}
                    disabled={isPending || !allowed}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select effort points" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((point) => (
                        <SelectItem key={point} value={point.toString()}>
                          {point} point{point !== 1 ? 's' : ''}
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
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Completion Progress</span>
                    <span className="text-muted-foreground">{field.value || 0}%</span>
                  </FormLabel>
                  <FormControl>
                    <div className="pt-2 pb-4">
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value || 0]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        disabled={isPending}
                        className="cursor-pointer"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="blockedById"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Blocked By
                      </FormLabel>
                      <Select
                        value={field.value || "no-blocked-by"}
                        onValueChange={field.onChange}
                        disabled={isPending || !allowed}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select task that blocks this" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no-blocked-by">
                            <div className="flex items-center gap-x-2">
                              <span className="text-muted-foreground">Not blocked</span>
                            </div>
                          </SelectItem>
                          {isTasksLoading ? (
                              <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">Loading tasks...</div>
                          ) : (
                              tasks.map((task: any) => (
                                <SelectItem key={task.id} value={task.id}>
                                  <div className="flex items-center justify-between gap-x-2">
                                    <span className="truncate">{task.name}</span>
                                  </div>
                                </SelectItem>
                              ))
                          )}
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
                      <FormLabel className="flex items-center gap-2">
                        Blocking To
                      </FormLabel>
                      <Select
                        value={field.value || "no-blocking-to"}
                        onValueChange={field.onChange}
                        disabled={isPending || !allowed}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select task that this blocks" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no-blocking-to">
                            <div className="flex items-center gap-x-2">
                              <span className="text-muted-foreground">Not blocking</span>
                            </div>
                          </SelectItem>
                          {isTasksLoading ? (
                              <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">Loading tasks...</div>
                          ) : (
                              tasks.map((task: any) => (
                                <SelectItem key={task.id} value={task.id}>
                                  <div className="flex items-center justify-between gap-x-2">
                                    <span className="truncate">{task.name}</span>
                                  </div>
                                </SelectItem>
                              ))
                          )}
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

            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-2 items-center">
                    Assignee (Optional)
                  </FormLabel>
                  <Select
                    value={field.value || "no-assignee"}
                    onValueChange={field.onChange}
                    disabled={isPending || !allowed}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select Assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-assignee">
                        <div className="flex items-center gap-x-2">
                          <span className="text-muted-foreground">No Assignee</span>
                        </div>
                      </SelectItem>
                      {isMembersLoading ? (
                          <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">Loading members...</div>
                      ) : (
                          memberOptions.map((member: any) => (
                            <SelectItem key={member.id} value={member.id}>
                              <div className="flex items-center gap-x-2">
                                <MemberAvatar 
                                  name={member.name} 
                                  className="size-6" 
                                  src={member.image}
                                  />
                                <span>{member.name}</span>
                              </div>
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between mt-1">
                    <FormLabel className="flex gap-2 items-center">
                      Status Column *
                    </FormLabel>
                    {!showNewColumnInput && allowed && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsNewColumn(true);
                                form.setValue("columnId", "");
                                form.clearErrors("columnId");
                            }}
                            className="text-[10px] text-primary hover:underline font-semibold"
                            disabled={isPending}
                        >
                            + Add New Column
                        </button>
                    )}
                    {showNewColumnInput && columns.length > 0 && allowed && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsNewColumn(false);
                                form.setValue("newColumnName", "");
                                form.clearErrors("newColumnName");
                            }}
                            className="text-[10px] text-primary hover:underline font-semibold"
                            disabled={isPending}
                        >
                            Select Existing
                        </button>
                    )}
                </div>
                
                {showNewColumnInput ? (
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
                                <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                                    <FormControl>
                                        <SelectTrigger className="h-11">
                                          <SelectValue placeholder="Select Column" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {isColumnsLoading ? (
                                            <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">Loading columns...</div>
                                        ) : (
                                            columns.map((col: any) => (
                                                <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                                            ))
                                        )}
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
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending || !allowed}>
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
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending || !allowed}>
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
                      <FormControl>
                        <CurrencySelector
                          value={field.value || "PKR"}
                          onValueChange={field.onChange}
                          className="h-10"
                          disabled={isPending || !allowed}
                        />
                      </FormControl>
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
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="1000"
                          placeholder="0.00"
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                          value={field.value || ""}
                          className="h-10"
                          disabled={isPending || !allowed}
                        />
                      </FormControl>
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
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the task details, requirements, and objectives..."
                      className="min-h-[100px] resize-none"
                      disabled={isPending || !allowed}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className={cn(!onCancel && "invisible")}
                  disabled={isPending}
                >
                  Cancel
                </Button>

                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending ? (
                    <>
                      <PageLoader />
                      Updating...
                    </>
                  ) : (
                    "Update Task"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};