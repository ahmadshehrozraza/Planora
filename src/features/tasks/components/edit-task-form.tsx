"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editTaskSchema } from "../schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { TaskPriority, TaskType, ColumnCategory } from "../types";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useUpdateTask } from "../api/use-update-task";
import { Textarea } from "@/components/ui/textarea";
import { CurrencySelector } from "@/components/currency-selector";
import { AlertCircle, X, Plus, Tag as TagIcon, Check } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageLoader } from "@/components/page-loader";
import { useGetTasks } from "../api/use-get-tasks";
import { useGetProjectColumns } from "@/features/projects/api/use-get-project-columns";
import { useGetProjectMembers } from "@/features/members/api/use-get-project-members";
import { useGetSprints } from "@/features/sprints/api/use-get-sprints";
import { useRouter, useParams } from "next/navigation";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { useQueryClient } from "@tanstack/react-query";
import { useGetTags, useCreateTag } from "@/features/tasks/api/use-task-tags";
import { TaskTagsModal } from "./task-tags-modal";

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

const TAG_COLORS = [
    "#e2e8f0", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"
];

export const EditTaskForm = ({ onCancel, initialValues }: EditTaskFormProps) => {
  
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const urlWorkspaceId = useWorkspaceId();
  const urlProjectId = params.projectId as string;

  const activeProjectId = extractId(initialValues.projectId) || urlProjectId;
  const activeWorkspaceId = urlWorkspaceId || extractId(initialValues.workspaceId);

  const { data: permissions } = useGetPermissions(activeWorkspaceId, activeProjectId);
  const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];
  
  const isGlobalAdmin = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE);
  const hasFullTaskUpdate = permissionsList.includes(PERMISSIONS.TASK_UPDATE_FULL);
  const hasStatusUpdateOnly = permissionsList.includes(PERMISSIONS.TASK_UPDATE_STATUS);
  
  const isAssignee = extractId(initialValues.assigneeId) === permissionsList[permissionsList.length - 1]; 
  
  const canUpdateFull = isGlobalAdmin || hasFullTaskUpdate || isAssignee;
  const canUpdateStatus = canUpdateFull || hasStatusUpdateOnly;

  const [isNewColumn, setIsNewColumn] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [isTaskTagsModalOpen, setIsTaskTagsModalOpen] = useState(false);
  
  const { mutate: updateTask, isPending } = useUpdateTask();
  const { mutate: createTag, isPending: isCreatingTag } = useCreateTag();

  const initialBlockedByIds = safeArray(initialValues.blockedBy).map(extractId);
  const initialBlockingToIds = safeArray(initialValues.blocking).map(extractId);
  const initialTagIds = safeArray(initialValues.tags).map(extractId);

  const form = useForm<z.infer<typeof editTaskSchema>>({
    resolver: zodResolver(editTaskSchema) as any,
    defaultValues: {
      name: initialValues.name || "",
      workspaceId: activeWorkspaceId,
      projectId: activeProjectId,
      columnId: extractId(initialValues.columnId),
      newColumnName: "",
      newColumnCategory: ColumnCategory.TODO,
      dueDate: initialValues.dueDate ? new Date(initialValues.dueDate) : new Date(),
      startDate: initialValues.startDate ? new Date(initialValues.startDate) : undefined,
      assigneeId: extractId(initialValues.assigneeId) || "no-assignee",
      sprintId: extractId(initialValues.sprintId) || "no-sprint",
      budget: initialValues.budget || 0,
      priority: initialValues.priority || TaskPriority.MEDIUM,
      effortPoints: initialValues.effortPoints || 1,
      description: initialValues.description || "",
      taskType: initialValues.taskType || TaskType.TASK,
      currency: initialValues.currency || "PKR",
      blockedByIds: initialBlockedByIds, 
      blockingToIds: initialBlockingToIds, 
      tagIds: initialTagIds,
    },
  });

  const watchBlockedByIds = form.watch("blockedByIds") || [];
  const watchBlockingToIds = form.watch("blockingToIds") || [];

  const { data: columnsData, isLoading: isLoadingColumns } = useGetProjectColumns(activeProjectId);
  const { data: tasksData, isLoading: isLoadingTasks } = useGetTasks({ workspaceId: activeWorkspaceId, projectId: activeProjectId });
  const { data: membersData, isLoading: isLoadingMembers } = useGetProjectMembers(activeProjectId);
  const { data: sprintsData, isLoading: isLoadingSprints } = useGetSprints(activeProjectId);
  const { data: projectTags, isLoading: isLoadingTags } = useGetTags(activeProjectId);

  const columns = useMemo(() => {
    const fetched = safeArray(columnsData);
    if (isLoadingColumns) return [];
    if (fetched.length > 0) return fetched.map((c: any) => ({ id: extractId(c), name: c.name }));
    
    const initialCol = initialValues.column;
    if (initialCol) {
      return [{ id: extractId(initialCol), name: initialCol.name || "Unknown" }];
    }
    return [];
  }, [columnsData, isLoadingColumns, initialValues]);

  const tasks = useMemo(() => {
    return safeArray(tasksData)
        .filter((t: any) => extractId(t) !== extractId(initialValues))
        .map((t: any) => ({ id: extractId(t), name: t.name }));
  }, [tasksData, initialValues]);

  const availableTags = projectTags || [];

  const memberOptions = useMemo(() => {
    const fetched = safeArray(membersData).map((m: any) => ({
      id: extractId(m.userId) || extractId(m),
      name: m.name || m.user?.name || "Unknown",
      image: m.image || m.user?.image
    }));
    
    if (isLoadingMembers) return [];
    if (fetched.length > 0) return fetched;
    
    if (initialValues.assignee && extractId(initialValues.assignee)) {
      return [{ 
        id: extractId(initialValues.assignee), 
        name: initialValues.assignee.name || "Unknown", 
        image: initialValues.assignee?.image 
      }];
    }
    return [];
  }, [membersData, isLoadingMembers, initialValues]);

  const sprintOptions = useMemo(() => {
    const fetched = safeArray(sprintsData).map((s: any) => ({
      id: extractId(s),
      name: s.name || "Unnamed",
    }));
    
    if (isLoadingSprints) return [];
    if (fetched.length > 0) return fetched;
    
    if (initialValues.sprint && extractId(initialValues.sprint)) {
      return [{ id: extractId(initialValues.sprint), name: initialValues.sprint.name || "Unnamed" }];
    }
    return [];
  }, [sprintsData, isLoadingSprints, initialValues]);

  useEffect(() => {
    if (!isLoadingColumns) {
      if (columns.length > 0) {
        const currentColId = form.getValues("columnId");
        const exists = columns.some(c => c.id === currentColId);
        if (!exists && currentColId) {
          form.setValue("columnId", "");
          setIsNewColumn(true);
        } else if (exists && !currentColId) {
          form.setValue("columnId", columns[0].id);
          setIsNewColumn(false);
        }
      } else {
        setIsNewColumn(true);
      }
    }
  }, [columns, isLoadingColumns, form]);

  const showNewColumnInput = isNewColumn || (!isLoadingColumns && columns.length === 0);

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
      if (!newTagName.trim() || !activeProjectId) return;
      createTag({ projectId: activeProjectId, name: newTagName.trim(), color: newTagColor }, {
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

  const onSubmit = (values: z.infer<typeof editTaskSchema>) => {
    if (!showNewColumnInput && (!values.columnId || values.columnId === "")) {
        form.setError("columnId", { type: "manual", message: "Status column is required" });
        return;
    }

    if (showNewColumnInput && (!values.newColumnName || values.newColumnName.trim() === "")) {
        form.setError("newColumnName", { type: "manual", message: "Column name is required" });
        return;
    }

    if (showNewColumnInput && !values.newColumnCategory) {
        form.setError("newColumnCategory", { type: "manual", message: "Category is required for new column" });
        return;
    }

    if (!validateCircularDependency()) return;

    const payload: any = { 
        ...values,
        id: extractId(initialValues) 
    };
    
    if (showNewColumnInput) {
        payload.columnId = undefined;
    } else {
        payload.newColumnName = undefined;
        payload.newColumnCategory = undefined;
    }

    if (payload.assigneeId === "no-assignee") payload.assigneeId = "";
    if (payload.sprintId === "no-sprint") payload.sprintId = "";
    if (payload.budget) payload.budget = Number(payload.budget);
    if (payload.effortPoints) payload.effortPoints = Number(payload.effortPoints);

    updateTask(payload, {
        onSuccess: (data) => {
            if(data?.success) {
                queryClient.invalidateQueries({ queryKey: ["columns", activeProjectId] });
                queryClient.invalidateQueries({ queryKey: ["tasks", activeWorkspaceId, activeProjectId] });
                queryClient.invalidateQueries({ queryKey: ["project-members", activeProjectId] });
                queryClient.invalidateQueries({ queryKey: ["sprints", activeProjectId] });
                queryClient.invalidateQueries({ queryKey: ["task", extractId(initialValues)] });
                
                form.reset();
                onCancel?.();
                router.refresh(); 
            }
        }
    });
  };

  const getTaskName = (id: string) => {
      const task = tasks.find((t: any) => t.id === id);
      if (task) return task.name;
      const initBlocked = safeArray(initialValues.blockedBy).find((t:any) => t.id === id);
      if (initBlocked) return initBlocked.name;
      const initBlocking = safeArray(initialValues.blocking).find((t:any) => t.id === id);
      if (initBlocking) return initBlocking.name;
      return "Unknown Task";
  };

  const getTagDetails = (id: string) => {
      const availableTag = availableTags.find((t: any) => t.id === id);
      if (availableTag) return availableTag;
      const initTag = safeArray(initialValues.tags).find((t:any) => t.id === id);
      if (initTag) return initTag;
      return null;
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Task Name *</FormLabel>
                    <FormControl>
                        <Input {...field} placeholder="Enter task name" disabled={isPending || !canUpdateFull} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="sprintId" render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex gap-2 items-center">
                        Sprint (Optional)
                    </FormLabel>
                    <Select value={field.value || "no-sprint"} onValueChange={field.onChange} disabled={isPending || !canUpdateFull}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Sprint" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="no-sprint">
                            <div className="flex items-center gap-x-2 text-muted-foreground">No Sprint</div>
                        </SelectItem>
                        {isLoadingSprints ? (
                            <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">Loading sprints...</div>
                        ) : (
                            <>
                            {sprintOptions.map((sprint: any) => (
                                <SelectItem key={sprint.id} value={sprint.id}>
                                <div className="flex items-center gap-x-2">
                                    <span>{sprint.name}</span>
                                </div>
                                </SelectItem>
                            ))}
                            {!isLoadingSprints && sprintOptions.length === 0 && (
                                <SelectItem value="no-sprints-available" disabled>
                                No sprints available for this project
                                </SelectItem>
                            )}
                            </>
                        )}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="assigneeId" render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex gap-2 items-center">Assignee (Optional) {isLoadingMembers && <PageLoader />}</FormLabel>
                    <Select value={field.value || "no-assignee"} onValueChange={(val) => field.onChange(val === "no-assignee" ? "" : val)} disabled={isPending || !canUpdateFull}>
                        <FormControl>
                        <SelectTrigger>
                            {isLoadingMembers ? (
                            <span className="text-muted-foreground">Loading members...</span>
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

                <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl><DatePicker {...field} value={field.value ?? undefined} onChange={field.onChange} placeholder="Select start date" disabled={isPending || !canUpdateFull} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Due Date *</FormLabel>
                        <FormControl><DatePicker {...field} value={field.value ?? undefined} onChange={field.onChange} placeholder="Select due date" disabled={isPending || !canUpdateFull} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="taskType" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Type *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange} disabled={isPending || !canUpdateFull}>
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
                        <Select value={field.value} onValueChange={field.onChange} disabled={isPending || !canUpdateFull}>
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
                        <FormLabel className="flex gap-2 items-center">Status Column *</FormLabel>
                        {!showNewColumnInput && canUpdateStatus && (
                            <button type="button" onClick={() => { setIsNewColumn(true); form.setValue("columnId", ""); form.setValue("newColumnName", ""); form.setValue("newColumnCategory", ColumnCategory.TODO); form.clearErrors(["columnId", "newColumnName", "newColumnCategory"]); }} className="text-[10px] text-primary hover:underline font-semibold" disabled={isPending}>+ Add New</button>
                        )}
                        {showNewColumnInput && columns.length > 0 && canUpdateStatus && (
                            <button type="button" onClick={() => { setIsNewColumn(false); form.setValue("newColumnName", ""); form.setValue("newColumnCategory", ColumnCategory.TODO); form.clearErrors(["newColumnName", "newColumnCategory"]); }} className="text-[10px] text-primary hover:underline font-semibold" disabled={isPending}>Select Existing</button>
                        )}
                    </div>
                    {showNewColumnInput ? (
                        <div className="flex gap-3">
                            <FormField control={form.control} name="newColumnName" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl><Input {...field} placeholder="Column Name (e.g. In QA)" disabled={isPending || !canUpdateStatus} className="h-10" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField control={form.control} name="newColumnCategory" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <Select value={field.value} onValueChange={field.onChange} disabled={isPending || !canUpdateStatus}>
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
                                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending || !canUpdateStatus}>
                                        <FormControl><SelectTrigger className="h-10">{isLoadingColumns ? <span className="text-muted-foreground">Loading...</span> : <SelectValue placeholder="Select Column" />}</SelectTrigger></FormControl>
                                        <SelectContent>
                                            {columns.map((col: any) => (<SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>))}
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
                        <Select value={field.value?.toString() || "1"} onValueChange={(val) => field.onChange(parseInt(val))} disabled={isPending || !canUpdateFull}>
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
                        <FormControl><CurrencySelector value={field.value || "PKR"} onValueChange={field.onChange} disabled={isPending || !canUpdateFull} /></FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="budget" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cost Amount</FormLabel>
                        <FormControl><Input {...field} type="number" min="0" step="1000" placeholder="0.00" onChange={(e) => field.onChange(Number(e.target.value) || 0)} value={field.value || ""} disabled={isPending || !canUpdateFull} className="h-10" /></FormControl>
                        </FormItem>
                    )} />
                </div>
            </div>

            <FormField control={form.control} name="tagIds" render={({ field }) => (
                <FormItem className="border p-4 rounded-md bg-muted/10">
                    <div className="flex items-center justify-between mb-2">
                        <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <TagIcon className="size-4" /> Category Tags {isLoadingTags && <PageLoader />}
                        </FormLabel>
                        <div className="flex items-center gap-3">
                            {!isAddingTag && canUpdateFull &&  (
                                <button type="button" onClick={() => setIsAddingTag(true)} className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1">
                                    <Plus className="size-3" /> Add New
                                </button>
                            )}
                            {canUpdateFull && (
                                <button type="button" onClick={() => setIsTaskTagsModalOpen(true)} className="text-[10px] text-muted-foreground hover:text-foreground hover:underline font-semibold flex items-center gap-1">
                                    Manage
                                </button>
                            )}
                        </div>
                    </div>

                    {isAddingTag && canUpdateFull && (
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
                        disabled={isLoadingTags || isPending || !canUpdateFull}
                        value="" 
                        onValueChange={(val) => {
                            if (val && !field.value?.includes(val)) {
                                field.onChange([...(field.value || []), val]);
                            }
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
                        {field.value?.map((id: string) => {
                            const tagInfo = getTagDetails(id);
                            if(!tagInfo) return null;
                            return (
                                <div key={id} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border shadow-sm" style={{ backgroundColor: `${tagInfo.color}20`, borderColor: tagInfo.color, color: '#333' }}>
                                    <div className="size-2 rounded-full" style={{ backgroundColor: tagInfo.color }}></div>
                                    <span className="truncate max-w-[150px] font-medium dark:text-white">{tagInfo.name}</span>
                                    {canUpdateFull && (
                                        <button type="button" onClick={() => field.onChange(field.value?.filter((v:string) => v !== id))} className="hover:opacity-70 ml-1">
                                            <X className="size-3" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <FormMessage />
                </FormItem>
            )} />

            {tasks && (
              <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                <h4 className="text-sm font-semibold mb-2">Dependencies (Optional)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="blockedByIds" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-xs">Blocked By {isLoadingTasks && <PageLoader />}</FormLabel>
                        <Select disabled={isLoadingTasks || isPending || !canUpdateFull} value="" onValueChange={(val) => { if (val && !field.value?.includes(val)) field.onChange([...(field.value || []), val]); }}>
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
                            {field.value?.map((id: string) => (
                                <div key={id} className="flex items-center gap-1 bg-destructive/10 text-destructive text-xs px-2 py-1 rounded-full border border-destructive/20">
                                    <span className="truncate max-w-[150px]">{getTaskName(id)}</span>
                                    {canUpdateFull && (
                                      <button type="button" onClick={() => field.onChange(field.value?.filter((v:string) => v !== id))} className="hover:text-foreground">
                                          <X className="size-3" />
                                      </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField control={form.control} name="blockingToIds" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-xs">Blocking To {isLoadingTasks && <PageLoader />}</FormLabel>
                        <Select disabled={isLoadingTasks || isPending || !canUpdateFull} value="" onValueChange={(val) => { if (val && !field.value?.includes(val)) field.onChange([...(field.value || []), val]); }}>
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
                            {field.value?.map((id: string) => (
                                <div key={id} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/20">
                                    <span className="truncate max-w-[150px]">{getTaskName(id)}</span>
                                    {canUpdateFull && (
                                      <button type="button" onClick={() => field.onChange(field.value?.filter((v:string) => v !== id))} className="hover:text-foreground">
                                          <X className="size-3" />
                                      </button>
                                    )}
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
                  <FormControl><Textarea {...field} value={field.value ?? ""} placeholder="Describe the task details, requirements, and objectives..." className="min-h-[100px] resize-none" disabled={isPending || !canUpdateFull} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <Button type="button" variant="outline" onClick={onCancel} className={cn(!onCancel && "invisible")} disabled={isPending}>Cancel</Button>
                {canUpdateStatus && (
                    <Button type="submit" size="lg" disabled={isPending}>
                      {isPending ? <><PageLoader /> Updating...</> : "Update Task"}
                    </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <TaskTagsModal 
          isOpen={isTaskTagsModalOpen} 
          setIsOpen={setIsTaskTagsModalOpen} 
          projectId={activeProjectId} 
      />
    </Card>
  );
};