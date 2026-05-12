"use client";

import { useState } from "react";
import { snakeCaseToTitleCase } from "@/lib/utils";
import {
    PencilIcon,
    Trash2Icon,
    CheckIcon,
    XIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfirm } from "@/hooks/use-confirm";
import { useColumnMutations } from "@/features/columns/api/use-columns";
import { useUpdateSprint } from "@/features/sprints/api/use-update-sprint";
import { useDeleteSprint } from "@/features/sprints/api/use-delete-sprint";
import { useGetSprints } from "@/features/sprints/api/use-get-sprints";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { ColumnCategory } from "@prisma/client";

interface KanbanColumnHeaderProps {
    columnId: string;
    board: string;
    category?: ColumnCategory;
    taskCount: number;
    groupBy?: "status" | "assignee" | "sprint";
    projectId: string;
}

export const KanbanColumnHeader = ({
    columnId,
    board,
    category = ColumnCategory.TODO,
    taskCount,
    groupBy = "status",
    projectId
}: KanbanColumnHeaderProps) => {

    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(board);
    const [editCategory, setEditCategory] = useState<ColumnCategory>(category);

    const workspaceId = useWorkspaceId() as string;

    const { updateColumn, deleteColumn } = useColumnMutations();
    const { mutate: updateSprint, isPending: isUpdatingSprint } = useUpdateSprint();
    const { mutate: deleteSprint, isPending: isDeletingSprint } = useDeleteSprint();
    const { data: sprints } = useGetSprints(projectId);

    const isSystemColumn = columnId === "unassigned" || columnId === "backlog";
    const canEdit = groupBy !== "assignee" && !isSystemColumn;

    const isPending = updateColumn.isPending || deleteColumn.isPending || isUpdatingSprint || isDeletingSprint;

    const [DeleteColumnDialog, confirmDeleteColumn] = useConfirm(
        "Delete Column & Tasks",
        "Are you absolutely sure? Deleting this column will PERMANENTLY DELETE all tasks inside it. This action cannot be undone.",
        "destructive"
    );

    const [DeleteSprintDialog, confirmDeleteSprint] = useConfirm(
        "Delete Sprint",
        "Are you absolutely sure you want to delete this sprint? Tasks will remain but lose their sprint association.",
        "destructive"
    );

    const handleDelete = async () => {
        if (groupBy === "sprint") {
            const ok = await confirmDeleteSprint();
            if (ok) deleteSprint({ sprintId: columnId, projectId });
        } else if (groupBy === "status") {
            const ok = await confirmDeleteColumn();
            if (ok) deleteColumn.mutate({ columnId, projectId, workspaceId });
        }
    };

    const handleSave = () => {
        if (editValue.trim() !== "") {
            if (groupBy === "sprint" && editValue !== board) {
                const existingSprint = sprints?.find((s: any) => s.id === columnId);
                updateSprint({ 
                    sprintId: columnId, 
                    projectId, 
                    values: { 
                        name: editValue.trim(),
                        goal: existingSprint?.goal,
                        description: existingSprint?.description,
                        status: existingSprint?.status,
                        capacityPoints: existingSprint?.capacityPoints,
                        startDate: existingSprint?.startDate,
                        dueDate: existingSprint?.dueDate
                    } 
                }, {
                    onSuccess: () => setIsEditing(false)
                });
            } else if (groupBy === "status") {
                updateColumn.mutate({ 
                    columnId, 
                    name: editValue.trim(), 
                    category: editCategory, 
                    projectId 
                }, {
                    onSuccess: () => setIsEditing(false)
                });
            } else {
                setIsEditing(false);
            }
        }
    };

    const handleCancel = () => {
        setEditValue(board);
        setEditCategory(category);
        setIsEditing(false);
    };

    const { data: permissions } = useGetPermissions( workspaceId );
    const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];
    const allowed = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.TASK_UPDATE_STATUS);

    return (
        <>
            {groupBy === "sprint" ? <DeleteSprintDialog /> : <DeleteColumnDialog />}
            
            <div className="px-2 py-1.5 flex items-center justify-between w-full group">
                { isEditing ? (
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center w-full gap-1">
                            <Input 
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-7 text-sm px-2 font-medium bg-background w-full"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSave();
                                    if (e.key === "Escape") handleCancel();
                                }}
                                disabled={isPending}
                            />
                        </div>
                        {groupBy === "status" && (
                            <div className="flex items-center w-full gap-1">
                                <Select value={editCategory} onValueChange={(val: ColumnCategory) => setEditCategory(val)} disabled={isPending}>
                                    <SelectTrigger className="h-7 text-xs w-full">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ColumnCategory.TODO}>To Do</SelectItem>
                                        <SelectItem value={ColumnCategory.IN_PROGRESS}>In Progress</SelectItem>
                                        <SelectItem value={ColumnCategory.DONE}>Done</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex gap-1 shrink-0">
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="size-7 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10" 
                                        onClick={handleSave}
                                        disabled={isPending || !editValue.trim()}
                                    >
                                        <CheckIcon className="size-4" />
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="size-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" 
                                        onClick={handleCancel}
                                        disabled={isPending}
                                    >
                                        <XIcon className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        {groupBy !== "status" && (
                            <div className="flex justify-end gap-1 mt-1">
                                 <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="size-7 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10" 
                                    onClick={handleSave}
                                    disabled={isPending || !editValue.trim()}
                                >
                                    <CheckIcon className="size-4" />
                                </Button>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="size-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" 
                                    onClick={handleCancel}
                                    disabled={isPending}
                                >
                                    <XIcon className="size-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-x-2 truncate">
                            <h2 className="text-sm font-medium truncate">
                                {snakeCaseToTitleCase(board)}
                            </h2>
                            <div className="size-5 flex items-center justify-center rounded-md bg-neutral-200 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 font-medium shrink-0">
                                {taskCount}
                            </div>
                        </div>

                        {allowed && canEdit && (
                        <div className="flex items-center gap-0.5 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsEditing(true)}
                                className="size-6 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            >
                                <PencilIcon className="size-3.5" />
                            </Button>
                            
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleDelete}
                                disabled={isPending}
                                className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2Icon className="size-3.5" />
                            </Button>
                        </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};