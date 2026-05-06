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
import { useConfirm } from "@/hooks/use-confirm";
import { useColumnMutations } from "@/features/columns/api/use-columns";

import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";

interface KanbanColumnHeaderProps {
    columnId: string;
    board: string;
    taskCount: number;
}

export const KanbanColumnHeader = ({
    columnId,
    board,
    taskCount,
}: KanbanColumnHeaderProps) => {

    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(board);

    const projectId = useProjectId() as string;
    const workspaceId = useWorkspaceId() as string;

    const { updateColumn, deleteColumn } = useColumnMutations();

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Column & Tasks",
        "Are you absolutely sure? Deleting this column will PERMANENTLY DELETE all tasks inside it. This action cannot be undone.",
        "destructive"
    );

    const handleDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;
        deleteColumn.mutate({ columnId, projectId, workspaceId });
    };

    const handleSave = () => {
        if (editValue.trim() !== "" && editValue !== board) {

            updateColumn.mutate({ columnId, name: editValue.trim(), projectId }, {
                onSuccess: () => setIsEditing(false)
            });
        } else {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditValue(board);
        setIsEditing(false);
    };

    const { data: permissions } = useGetPermissions( workspaceId );
    const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];
    const allowed = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE) || permissionsList.includes(PERMISSIONS.TASK_UPDATE_STATUS);

    return (
        <>
            <DeleteDialog />
            
            <div className="px-2 py-1.5 flex items-center justify-between w-full group">
                { isEditing ? (
                    <div className="flex items-center w-full gap-1">
                        
                        <Input 
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-7 text-sm px-2 font-medium bg-background"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSave();
                                if (e.key === "Escape") handleCancel();
                            }}
                            disabled={updateColumn.isPending}
                        />
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="size-7 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 shrink-0" 
                            onClick={handleSave}
                            disabled={updateColumn.isPending || !editValue.trim()}
                        >
                            <CheckIcon className="size-4" />
                        </Button>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="size-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 shrink-0" 
                            onClick={handleCancel}
                            disabled={updateColumn.isPending}
                        >
                            <XIcon className="size-4" />
                        </Button>
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

                        {allowed && (

                        <div className="flex items-center gap-0.5 shrink-0 ml-2">
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
                                disabled={deleteColumn.isPending}
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