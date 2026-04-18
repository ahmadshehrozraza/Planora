"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
}   from "@/components/ui/dropdown-menu";
import { useDeleteTask } from "../api/use-delete-task";
import { useConfirm } from "@/hooks/use-confirm";
import { ExternalLink, PencilIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { useSession } from "next-auth/react";

interface TaskActionsProps {
    id: string;
    projectId: string;
    assigneeId?: string; 
    assigneeEmail?: string; 
    children: React.ReactNode;
}

export const TaskActions = ({
    id,
    projectId,
    assigneeId,
    assigneeEmail,
    children,
}: TaskActionsProps) => {

    const router = useRouter();
    const workspaceId = useWorkspaceId();

    const { data: session } = useSession();
    const currentUserId = (session?.user as any)?.id;
    const currentUserEmail = session?.user?.email;

    const { data: permissions } = useGetPermissions(workspaceId, projectId);
    const allowed = (permissions?.workspaceAdmin || permissions?.projectManager) ?? false;

    const isAssignee = Boolean(
        (currentUserId && assigneeId && assigneeId === currentUserId) || 
        (currentUserEmail && assigneeEmail && assigneeEmail === currentUserEmail)
    );

    const canEdit = allowed || isAssignee;
    const canDelete = allowed; 

    const { open } = useEditTaskModal();

    const [ConfirmationDialog, confirm] = useConfirm(
        "Delete task",
        "This action cannot be undone",
        "destructive"
    );

    const { mutate, isPending } = useDeleteTask();

    const onDelete = async () => {
        const ok = await confirm();
        if(!ok) return;

        mutate(id,{
            onSuccess: () => {
                router.push(`/workspaces/${workspaceId}/tasks`);
            }
        });
    }

    const onOpenTask = () => {
        router.push(`/workspaces/${workspaceId}/tasks/${id}`);
    }
    const onOpenProject = () => {
        router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
    }

    return(
        <div className="flex justify-end">
            <ConfirmationDialog />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>

                <DropdownMenuContent  align="end" className="w-48">
                    <DropdownMenuItem
                    onClick={onOpenTask}
                    className="font-medium p-[10px]"
                    >
                        <ExternalLink className="size-4 mr-2 stroke-2" />
                        Task Details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                    onClick={onOpenProject}
                    className="font-medium p-[10px]"
                    >
                        <ExternalLink className="size-4 mr-2 stroke-2" />
                        Open Project
                    </DropdownMenuItem>

                    {canEdit && (
                        <DropdownMenuItem
                        onClick={() => open(id)}
                        className="font-medium p-[10px]"
                        >
                            <PencilIcon className="size-4 mr-2 stroke-2" />
                            Edit Task
                        </DropdownMenuItem>
                    )}

                    {canDelete && (
                        <DropdownMenuItem
                        onClick={onDelete}
                        disabled={isPending}
                        className="text-amber-700 focus:text-amber-700 font-medium p-[10px]"
                        >
                            <TrashIcon className="size-4 mr-2 stroke-2" />
                            Delete Task
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}