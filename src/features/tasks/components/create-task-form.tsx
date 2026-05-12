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
import { TaskType, TaskPriority, ColumnCategory } from "../types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useState, useEffect, useRef, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CurrencySelector } from "@/components/currency-selector";
import { useCreateTask } from "../api/use-create-task";
import { useGetProjectColumns } from "@/features/projects/api/use-get-project-columns";
import { useGetSprints } from "@/features/sprints/api/use-get-sprints";
import { useGetTasks } from "../api/use-get-tasks";
import { useGetProjectMembers } from "@/features/members/api/use-get-project-members"; 
import { PageLoader } from "@/components/page-loader";
import { AlertCircle, X, Plus, Tag as TagIcon, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";

import { useGetTags, useCreateTag } from "@/features/tasks/api/use-task-tags";
import { TaskTagsModal } from "./task-tags-modal";

const TAG_COLORS = [
    "#e2e8f0", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"
];

interface CreateTaskFormProps {
  onCancel?: () => void;
  projectOptions: { id: string, name: string, imageUrl: string }[];
};

export const CreateTaskForm = ({ onCancel, projectOptions }: CreateTaskFormProps) => {
  const workspaceId = useWorkspaceId();
  const prevProjectId = useRef<string>("");
  
  const [isNewColumn, setIsNewColumn] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [isTaskTagsModalOpen, setIsTaskTagsModalOpen] = useState(false);

  const { mutate, isPending } = useCreateTask();
  const { mutate: createTag, isPending: isCreatingTag } = useCreateTag();

  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema) as any,
    defaultValues: {
      name: "",
      workspaceId: workspaceId || "",
      projectId: "",
      sprintId: "",
      columnId: "",
      newColumnName: "",
      newColumnCategory: ColumnCategory.TODO,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assigneeId: "",
      description: "",
      taskType: TaskType.TASK,
      priority: TaskPriority.MEDIUM,
      budget: 0,
      effortPoints: 1,
      startDate: new Date(),
      blockedByIds: [],
      blockingToIds: [],
      tagIds: [],
      currency: "PKR",
    },
  });

  const watchProjectId = form.watch("projectId");
  const watchBlockedByIds = form.watch("blockedByIds") || [];
  const watchBlockingToIds = form.watch("blockingToIds") || [];
  const watchStartDate = form.watch("startDate");

  const { data: projectPerms, isLoading: isLoadingPerms } = useGetPermissions(workspaceId, watchProjectId);
  const { data: columns, isLoading: isLoadingColumns } = useGetProjectColumns(watchProjectId);
  const { data: sprints, isLoading: isLoadingSprints } = useGetSprints(watchProjectId);
  const { data: tasksResponse, isLoading: isLoadingTasks } = useGetTasks({ workspaceId, projectId: watchProjectId });
  const { data: membersData, isLoading: isLoadingMembers } = useGetProjectMembers(watchProjectId);
  const { data: projectTags, isLoading: isLoadingTags } = useGetTags(watchProjectId);

  const isFetchingPerms = !!watchProjectId && isLoadingPerms;
  const isFetchingColumns = !!watchProjectId && isLoadingColumns;
  const isFetchingSprints = !!watchProjectId && isLoadingSprints;
  const isFetchingTasks = !!watchProjectId && isLoadingTasks;
  const isFetchingMembers = !!watchProjectId && isLoadingMembers;

  const permissionsList: string[] = Array.isArray(projectPerms) ? projectPerms : [];
  const canManageSelectedProject = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.TASK_CREATE);
  const tasks = tasksResponse || [];
  const availableTags = projectTags || [];
  
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
      form.setValue("sprintId", "");
      form.setValue("columnId", "");
      form.setValue("newColumnName", "");
      form.setValue("newColumnCategory", ColumnCategory.TODO);
      form.setValue("blockedByIds", []);
      form.setValue("blockingToIds", []);
      form.setValue("tagIds", []);
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
    const blocked = form.getValues("blockedByIds") || [];
    const blocking = form.getValues("blockingToIds") || [];
    const commonTask = blocked.find(id => blocking.includes(id));

    if (commonTask) {
        form.setError("blockingToIds", {
            type: "manual",
            message: "Circular dependency detected. A task cannot block and be blocked by the same task."
        });
        return false;
    }
    return true;
  };

  const handleCreateNewTag = () => {
      if (!newTagName.trim() || !watchProjectId) return;
      createTag({ projectId: watchProjectId, name: newTagName.trim(), color: newTagColor }, {
          onSuccess: (response) => {
              if (response?.data?.id) {
                  const currentTags = form.getValues("tagIds") || [];
                  form.setValue("tagIds", [...currentTags, response.data.id]);
                  setNewTagName("");
                  setIsAddingTag(false);
                  setNewTagColor(TAG_COLORS[0]);
              }
          }
      });
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

    if (isNewColumn && !values.newColumnCategory) {
        form.setError("newColumnCategory", { type: "manual", message: "Category is required for new column" });
        return;
    }

    const startVal = new Date(values.startDate || new Date());
    startVal.setHours(0, 0, 0, 0);
    const dueVal = new Date(values.dueDate);
    dueVal.setHours(0, 0, 0, 0);

    if (dueVal < startVal) {
        form.setError("dueDate", { type: "manual", message: "Due date cannot be before Start date" });
        return;
    }

    if (!validateCircularDependency()) return;

    const payload = { ...values };
    
    if (isNewColumn) {
        payload.columnId = undefined;
    } else {
        payload.newColumnName = undefined;
        payload.newColumnCategory = undefined;
    }

    if (payload.assigneeId === "no-assignee") payload.assigneeId = "";
    if (payload.sprintId === "no-sprint") payload.sprintId = "";
    if (payload.budget) payload.budget = Number(payload.budget);
    if (payload.effortPoints) payload.effortPoints = Number(payload.effortPoints);

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

  const isSubmissionDisabled = isPending || (!!watchProjectId && !canManageSelectedProject && !isFetchingPerms);
  const getTaskName = (id: string) => tasks.find((t: any) => t.id === id)?.name || "Unknown Task";
  const getTagDetails = (id: string) => availableTags.find((t: any) => t.id === id);

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-2">
        <CardTitle className="text-xl font-bold">Create a new Task</CardTitle>
      </CardHeader>
      <div className="px-3">
        <Separator />
      </div>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Task Name *</FormLabel>
                        <FormControl><Input {...field} placeholder="Enter task name" disabled={isPending} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="projectId" render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex gap-2 items-center">Project * {isFetchingPerms && <PageLoader />}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                        <FormControl>
                        <SelectTrigger className={cn(!canManageSelectedProject && watchProjectId && !isFetchingPerms && "border-destructive/80 bg-destructive/10")}>
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
                    {(!canManageSelectedProject && watchProjectId && !isFetchingPerms) && (
                        <p className="text-[12px] text-destructive font-semibold mt-1 flex items-center gap-1">
                            <AlertCircle className="size-3" /> You are not a manager in this project.
                        </p>
                    )}
                    <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="sprintId" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="flex gap-2 items-center">Sprint (Optional) {isFetchingSprints && <PageLoader />}</FormLabel>
                        <Select value={field.value || "no-sprint"} onValueChange={(val) => field.onChange(val === "no-sprint" ? "" : val)} disabled={isFetchingSprints || isPending}>
                        <FormControl>
                            <SelectTrigger>
                            {isFetchingSprints ? (
                                <div className="flex items-center gap-2"><PageLoader /><span>Loading...</span></div>
                            ) : (
                                <SelectValue placeholder="Select Sprint" />
                            )}
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="no-sprint"><span className="text-muted-foreground">No Sprint</span></SelectItem>
                            {sprints?.map((sprint: any) => (
                            <SelectItem key={sprint.id} value={sprint.id}>{sprint.name}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />


                <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl><DatePicker {...field} value={field.value ?? undefined} onChange={field.onChange} placeholder="Select start date" disabled={isPending} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="dueDate" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Due Date *</FormLabel>
                        <FormControl><DatePicker {...field} value={field.value ?? undefined} onChange={field.onChange} placeholder="Select due date" disabled={isPending} fromDate={watchStartDate} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="taskType" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Type *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value={TaskType.FEATURE}>Feature</SelectItem>
                            <SelectItem value={TaskType.TASK}>Task</SelectItem>
                            <SelectItem value={TaskType.BUG}>Bug</SelectItem>
                            <SelectItem value={TaskType.SPIKE}>Spike</SelectItem>
                            <SelectItem value={TaskType.DOCS}>Docs</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Priority *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                            <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                            <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                            <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />

                <div className="flex flex-col space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between mt-1">
                        <FormLabel className="flex gap-2 items-center">Status Column * {isFetchingColumns && <PageLoader />}</FormLabel>
                        <button type="button" onClick={() => { setIsNewColumn(!isNewColumn); form.setValue("columnId", ""); form.setValue("newColumnName", ""); form.setValue("newColumnCategory", ColumnCategory.TODO); form.clearErrors(["columnId", "newColumnName", "newColumnCategory"]); }} className="text-[10px] text-primary hover:underline font-semibold" disabled={isPending || (!columns?.length && !isNewColumn)}>
                            {isNewColumn ? "Select Existing" : "+ Add New"}
                        </button>
                    </div>
                    {isNewColumn ? (
                        <div className="flex gap-3">
                            <FormField control={form.control} name="newColumnName" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl><Input {...field} placeholder="Column Name (e.g. In QA)" disabled={isPending} className="h-10" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField control={form.control} name="newColumnCategory" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Category" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value={ColumnCategory.TODO}>To Do</SelectItem>
                                                <SelectItem value={ColumnCategory.IN_PROGRESS}>In Progress</SelectItem>
                                                <SelectItem value={ColumnCategory.DONE}>Done</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    ) : (
                        <FormField control={form.control} name="columnId" render={({ field }) => (
                                <FormItem>
                                    <Select value={field.value} onValueChange={field.onChange} disabled={isFetchingColumns || !watchProjectId || isPending}>
                                        <FormControl>
                                            <SelectTrigger className="h-10">
                                            {isFetchingColumns ? <span className="text-muted-foreground">Loading...</span> : <SelectValue placeholder="Select Column" />}
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {columns?.map((col: any) => (<SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <FormField control={form.control} name="effortPoints" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Effort Points (1-10)</FormLabel>
                        <Select value={field.value?.toString() || "1"} onValueChange={(val) => field.onChange(parseInt(val))} disabled={isPending}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select effort points" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((point) => (
                            <SelectItem key={point} value={point.toString()}>{point} point{point !== 1 ? 's' : ''}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4 items-end">
                    <FormField control={form.control} name="currency" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl><CurrencySelector value={field.value || "PKR"} onValueChange={field.onChange} disabled={isPending} /></FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="budget" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cost Amount</FormLabel>
                        <FormControl><Input {...field} type="number" min="0" step="1000" placeholder="0.00" onChange={(e) => field.onChange(Number(e.target.value) || 0)} value={field.value || ""} disabled={isPending} className="h-10" /></FormControl>
                        </FormItem>
                    )} />
                </div>

                <FormField control={form.control} name="assigneeId" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">Assignee (Optional) {isFetchingMembers && <PageLoader />}</FormLabel>
                    <Select value={field.value || "no-assignee"} onValueChange={(val) => field.onChange(val === "no-assignee" ? "" : val)} disabled={isPending || isFetchingMembers || !watchProjectId}>
                        <FormControl>
                        <SelectTrigger>
                            {isFetchingMembers ? (
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
                        {memberOptions.map((member: any) => (
                            <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-x-2">
                                <MemberAvatar className="size-6" name={member.name} src={member.image} />
                                <span>{member.name}</span>
                            </div>
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )} />

            </div>

            {watchProjectId && (
                <FormField control={form.control} name="tagIds" render={({ field }) => (
                    <FormItem className="border p-4 rounded-md bg-muted/10">
                        <div className="flex items-center justify-between mb-2">
                            <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                                <TagIcon className="size-4" /> Category Tags {isLoadingTags && <PageLoader />}
                            </FormLabel>
                            <div className="flex items-center gap-3">
                                {!isAddingTag &&  (
                                    <button type="button" onClick={() => setIsAddingTag(true)} className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1">
                                        <Plus className="size-3" /> Add New
                                    </button>
                                )}
                                <button type="button" onClick={() => setIsTaskTagsModalOpen(true)} className="text-[10px] text-muted-foreground hover:text-foreground hover:underline font-semibold flex items-center gap-1">
                                    Manage
                                </button>
                            </div>
                        </div>

                        {isAddingTag && (
                            <div className="flex flex-col gap-3 mb-4 p-3 bg-card border rounded-md shadow-sm">
                                <Input 
                                    placeholder="Tag name (e.g. Frontend)" 
                                    value={newTagName} 
                                    onChange={(e) => setNewTagName(e.target.value)} 
                                    disabled={isCreatingTag}
                                    className="h-9 text-xs"
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {TAG_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setNewTagColor(color)}
                                                className={cn("size-5 rounded-full cursor-pointer transition flex items-center justify-center border", newTagColor === color ? "ring-2 ring-offset-1 ring-primary" : "")}
                                                style={{ backgroundColor: color }}
                                            >
                                                {newTagColor === color && <Check className="size-3 text-black mix-blend-difference" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingTag(false)} className="h-7 text-xs px-2" disabled={isCreatingTag}>Cancel</Button>
                                        <Button type="button" size="sm" onClick={handleCreateNewTag} className="h-7 text-xs px-3" disabled={!newTagName.trim() || isCreatingTag}>
                                            {isCreatingTag ? "Saving..." : "Save"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Select
                            disabled={isLoadingTags || isPending}
                            value="" 
                            onValueChange={(val) => {
                                if (val && !field.value?.includes(val)) field.onChange([...(field.value || []), val]);
                            }}
                        >
                            <FormControl>
                                <SelectTrigger className="h-10 text-xs">
                                    <span className="text-muted-foreground">Select tags...</span>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {availableTags.filter((t: any) => !field.value?.includes(t.id)).length === 0 ? (
                                    <SelectItem value="none" disabled>No more tags available</SelectItem>
                                ) : (
                                    availableTags.filter((t: any) => !field.value?.includes(t.id)).map((tag: any) => (
                                        <SelectItem key={tag.id} value={tag.id}>
                                            <div className="flex items-center gap-2">
                                                <div className="size-3 rounded-full" style={{ backgroundColor: tag.color }}></div>
                                                <span className="truncate">{tag.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {field.value?.map((id) => {
                                const tagInfo = getTagDetails(id);
                                if(!tagInfo) return null;
                                return (
                                    <div key={id} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border shadow-sm" style={{ backgroundColor: `${tagInfo.color}20`, borderColor: tagInfo.color, color: '#333' }}>
                                        <div className="size-2 rounded-full" style={{ backgroundColor: tagInfo.color }}></div>
                                        <span className="truncate max-w-[150px] font-medium dark:text-white">{tagInfo.name}</span>
                                        <button type="button" onClick={() => field.onChange(field.value?.filter(v => v !== id))} className="hover:opacity-70 ml-1">
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <FormMessage />
                    </FormItem>
                )} />
            )}

            {watchProjectId && tasks && (
              <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                <h4 className="text-sm font-semibold mb-2">Dependencies (Optional)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="blockedByIds" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-xs">Blocked By {isFetchingTasks && <PageLoader />}</FormLabel>
                        <Select disabled={isFetchingTasks || isPending} value="" onValueChange={(val) => { if (val && !field.value?.includes(val)) field.onChange([...(field.value || []), val]); }}>
                          <FormControl>
                            <SelectTrigger>
                              <span className="text-muted-foreground">Add blocking task...</span>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tasks.filter((t: any) => !field.value?.includes(t.id)).length === 0 ? (
                                <SelectItem value="none" disabled>No more tasks available</SelectItem>
                            ) : (
                                tasks.filter((t: any) => !field.value?.includes(t.id)).map((task: any) => (
                                  <SelectItem key={task.id} value={task.id}>
                                    <span className="truncate">{task.name}</span>
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                            {field.value?.map((id) => (
                                <div key={id} className="flex items-center gap-1 bg-destructive/10 text-destructive text-xs px-2 py-1 rounded-full border border-destructive/20">
                                    <span className="truncate max-w-[150px]">{getTaskName(id)}</span>
                                    <button type="button" onClick={() => field.onChange(field.value?.filter(v => v !== id))} className="hover:text-foreground">
                                        <X className="size-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField control={form.control} name="blockingToIds" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-xs">Blocking To {isFetchingTasks && <PageLoader />}</FormLabel>
                        <Select disabled={isFetchingTasks || isPending} value="" onValueChange={(val) => { if (val && !field.value?.includes(val)) field.onChange([...(field.value || []), val]); }}>
                          <FormControl>
                            <SelectTrigger>
                              <span className="text-muted-foreground">Add task this blocks...</span>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                             {tasks.filter((t: any) => !field.value?.includes(t.id)).length === 0 ? (
                                <SelectItem value="none" disabled>No more tasks available</SelectItem>
                            ) : (
                                tasks.filter((t: any) => !field.value?.includes(t.id)).map((task: any) => (
                                  <SelectItem key={task.id} value={task.id}>
                                    <span className="truncate">{task.name}</span>
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {field.value?.map((id) => (
                                <div key={id} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/20">
                                    <span className="truncate max-w-[150px]">{getTaskName(id)}</span>
                                    <button type="button" onClick={() => field.onChange(field.value?.filter(v => v !== id))} className="hover:text-foreground">
                                        <X className="size-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {watchBlockedByIds.some((id: string) => watchBlockingToIds.includes(id)) && (
                    <Alert variant="destructive" className="py-2 mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Circular dependency detected! A task cannot block and be blocked by the same task.
                      </AlertDescription>
                    </Alert>
                )}
              </div>
            )}

            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description</FormLabel>
                  <FormControl><Textarea {...field} value={field.value ?? ""} placeholder="Describe the task details, requirements, and objectives..." className="min-h-[100px] resize-none" disabled={isPending} /></FormControl>
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
      <TaskTagsModal 
          isOpen={isTaskTagsModalOpen} 
          setIsOpen={setIsTaskTagsModalOpen} 
          projectId={watchProjectId}
      />
    </Card>
  );
};