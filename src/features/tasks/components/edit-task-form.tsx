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
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Task, TaskPriority, TaskStatus, TaskType } from "../types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useUpdateTask } from "../api/use-update-task";
import { Textarea } from "@/components/ui/textarea";
import { CurrencySelector } from "@/components/currency-selector";
import { Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { dummySegments } from "@/features/segments/hooks/dummy-segments";

interface EditTaskFormProps {
  onCancel?: () => void;
  projectOptions: { id: string; name: string; imageUrl: string }[];
  memberOptions: { id: string; name: string; userId: string }[];
  initialValues: Task;
  segmentOptions: { id: string; name: string }[];
}

export const EditTaskForm = ({
  onCancel,
  projectOptions,
  memberOptions,
  initialValues,
  segmentOptions
}: EditTaskFormProps) => {
  const workspaceId = useWorkspaceId();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialValues.projectId);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [taskOptions, setTaskOptions] = useState<{ id: string, name: string, status: TaskStatus }[]>([]);
  const { mutate: updateTask, isPending } = useUpdateTask();

  const form = useForm<z.infer<typeof editTaskSchema>>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      ...initialValues,
      dueDate: initialValues.endDate ? new Date(initialValues.endDate) : new Date(),
      startDate: initialValues.startDate ? new Date(initialValues.startDate) : new Date(),
      assigneeId: initialValues.assigneeId || "",
      segmentId: initialValues.segmentId || "",
      budget: initialValues.budget || 0,
      priority: initialValues.taskPriority || TaskPriority.LOW,
      effortPoints: initialValues.effortPoints || 1,
      description: initialValues.description || "",
      currency: initialValues?.currency || "PKR",
      blockedBy: initialValues?.blockedBy || "",
      blockingTo: initialValues?.blockingTo || "",
    },
  });

  // Watch for project changes
  const watchProjectId = form.watch("projectId");
  const watchBlockedBy = form.watch("blockedBy");
  const watchBlockingTo = form.watch("blockingTo");

  useEffect(() => {
    if (watchProjectId && watchProjectId !== selectedProjectId) {
      setSelectedProjectId(watchProjectId);
      loadTasksForProject(watchProjectId);
      // Reset segment when project changes
      form.setValue("segmentId", "");
    }
  }, [watchProjectId]);

  // Load dummy tasks for dependencies
  const loadTasksForProject = (projectId: string) => {
    setIsLoadingTasks(true);

     out(() => {
      // Dummy tasks for edit form
      const dummyTasks = [
        { id: "task-1", name: "Design Homepage", status: TaskStatus.IN_PROGRESS },
        { id: "task-2", name: "API Integration", status: TaskStatus.TODO },
        { id: "task-3", name: "Database Setup", status: TaskStatus.DONE },
        { id: "task-4", name: "Testing", status: TaskStatus.IN_REVIEW },
        { id: "task-5", name: "User Authentication", status: TaskStatus.TODO },
        { id: "task-6", name: "Mobile Responsive", status: TaskStatus.IN_PROGRESS },
      ].filter(task => task.id !== initialValues.id); // Exclude current task from blocking itself

      setTaskOptions(dummyTasks);
      setIsLoadingTasks(false);
    }, 300);
  };

  // Load tasks on initial render
  useEffect(() => {
    if (initialValues.projectId) {
      loadTasksForProject(initialValues.projectId);
    }
  }, [initialValues.projectId]);

  // Validate circular dependency
  const validateCircularDependency = () => {
    const blockedBy = form.getValues("blockedBy");
    const blockingTo = form.getValues("blockingTo");

    if (blockedBy && blockedBy !== "no-blocked-by" &&
      blockingTo && blockingTo !== "no-blocking-to" &&
      blockedBy === blockingTo) {
      form.setError("blockingTo", {
        type: "manual",
        message: "A task cannot block itself"
      });
      return false;
    }
    return true;
  };

  const onSubmit = (values: z.infer<typeof editTaskSchema>) => {
    if (!validateCircularDependency()) {
      return;
    }

    const payload = {
      ...values,
      workspaceId,
    };

    // updateTask(
    //   {
    //     json: payload,
    //     param: { taskId: initialValues.id },
    //   },
    //   {
    //     onSuccess: () => {
    //       onCancel?.();
    //     },
    //   }
    // );

    console.log("Update task form values: ", payload);
    alert("Task updated successfully!");
    onCancel?.();
  };

  if (!workspaceId) return null;

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Task Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter task name" className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Project Selection */}
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectOptions.length > 0 ? (
                        projectOptions.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center gap-x-2">
                              <ProjectAvatar
                                className="size-6"
                                name={project.name}
                                image={project.imageUrl}
                              />
                              <span>{project.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-projects" disabled>
                          No projects available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Segment Selection */}
            {selectedProjectId && (
              <FormField
                control={form.control}
                name="segmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Segment (Optional)</FormLabel>
                    <Select
                      value={field.value || "no-segment"}
                      onValueChange={(val) => field.onChange(val === "no-segment" ? "" : val)}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select Segment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no-segment">
                          <div className="flex items-center gap-x-2">No Segment</div>
                        </SelectItem>
                        {segmentOptions.map((segment) => (
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Dates Section */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DatePicker {...field} placeholder="Select start date" className="h-11" />
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
                      <DatePicker {...field} placeholder="Select due date" className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Effort Points */}
            <FormField
              control={form.control}
              name="effortPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effort Points (1-10)</FormLabel>
                  <Select
                    value={field.value?.toString() || "1"}
                    onValueChange={(val) => field.onChange(parseInt(val))}
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

            {/* Dependencies Section - Only show if project is selected */}
            {selectedProjectId && taskOptions.length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="blockedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Blocked By
                          {isLoadingTasks && (
                            <Loader className="h-3 w-3 animate-spin" />
                          )}
                        </FormLabel>
                        <Select
                          value={field.value || "no-blocked-by"}
                          onValueChange={(val) => field.onChange(val === "no-blocked-by" ? "" : val)}
                          disabled={isLoadingTasks}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              {isLoadingTasks ? (
                                <span className="text-muted-foreground">Loading tasks...</span>
                              ) : (
                                <SelectValue placeholder="Select task that blocks this" />
                              )}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no-blocked-by">
                              <div className="flex items-center gap-x-2">
                                <span className="text-muted-foreground">Not blocked</span>
                              </div>
                            </SelectItem>
                            {taskOptions.map((task) => (
                              <SelectItem key={task.id} value={task.id}>
                                <div className="flex items-center justify-between gap-x-2">
                                  <span className="truncate">{task.name}</span>
                                  <Badge variant={task.status}>{task.status}</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {field.value && field.value !== "no-blocked-by" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            This task will wait for selected task to complete
                          </p>
                        )}
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
                          {isLoadingTasks && (
                            <Loader className="h-3 w-3 animate-spin" />
                          )}
                        </FormLabel>
                        <Select
                          value={field.value || "no-blocking-to"}
                          onValueChange={(val) => field.onChange(val === "no-blocking-to" ? "" : val)}
                          disabled={isLoadingTasks}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              {isLoadingTasks ? (
                                <span className="text-muted-foreground">Loading tasks...</span>
                              ) : (
                                <SelectValue placeholder="Select task that this blocks" />
                              )}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no-blocking-to">
                              <div className="flex items-center gap-x-2">
                                <span className="text-muted-foreground">Not blocking</span>
                              </div>
                            </SelectItem>
                            {taskOptions.map((task) => (
                              <SelectItem key={task.id} value={task.id}>
                                <div className="flex items-center justify-between gap-x-2">
                                  <span className="truncate">{task.name}</span>
                                  <Badge variant={task.status}>{task.status}</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {field.value && field.value !== "no-blocking-to" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Selected task will wait for this task to complete
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                {/* Circular dependency warning */}
                {(watchBlockedBy && watchBlockedBy !== "no-blocked-by" &&
                  watchBlockingTo && watchBlockingTo !== "no-blocking-to" &&
                  watchBlockedBy === watchBlockingTo) && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Circular dependency detected! A task cannot block itself.
                      </AlertDescription>
                    </Alert>
                  )}
              </div>
            )}

            {/* Assignee */}
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee (Optional)</FormLabel>
                  <Select
                    value={field.value || "no-assignee"}
                    onValueChange={(val) => field.onChange(val === "no-assignee" ? "" : val)}
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
                      {memberOptions.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-x-2">
                            {/* Simple avatar without MemberAvatar component to fix duplication */}
                            <div className="size-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
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

            {/* Status, Type, Priority */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                        <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                        <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                        <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                      </FormControl>
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                      </FormControl>
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

            {/* Budget Section */}
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
                      <FormLabel className="text-xs font-medium">
                        Cost Amount
                      </FormLabel>
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
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Description */}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
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
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
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