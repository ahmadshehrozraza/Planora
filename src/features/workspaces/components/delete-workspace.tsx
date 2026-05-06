"use client";

import { Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { useResetInviteCode } from "../api/use-reset-invite-code";

interface WorkspaceDeleteProps {
  workspaceId: string;
}

export const WorkspaceDelete = ({ workspaceId }: WorkspaceDeleteProps) => {
  const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } = useDeleteWorkspace();
  const { mutate: resetInviteCode, isPending: isResettingInviteCode } = useResetInviteCode();

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Workspace",
    "This action cannot be undone. All projects, tasks, and data will be permanently removed.",
    "destructive"
  );

  const [ResetDialog, confirmReset] = useConfirm(
    "Reset Invite Link",
    "This will invalidate the current invite link. Members will need a new link to join.",
    "destructive"
  );

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;

    deleteWorkspace(
      { workspaceId }, 
      { onSuccess: () => { window.location.href = "/"; } }
    );
  };

  const handleResetInviteCode = async () => {
    const ok = await confirmReset();
    if (!ok) return;

    resetInviteCode({ workspaceId });
  };

  return (
    <Card className="w-full shadow-sm border border-destructive/20 bg-destructive/5 rounded-lg">
      <DeleteDialog />
      <ResetDialog />
      
      <CardHeader className="border-b border-destructive/10 pb-4">
        <CardTitle className="text-xl text-destructive dark:text-red-500">Danger Zone</CardTitle>
        <CardDescription className="text-destructive/80 dark:text-red-400">
          Irreversible and destructive actions for this workspace.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 flex flex-col gap-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h4 className="font-medium text-foreground">Reset Invite Link</h4>
            <p className="text-sm text-muted-foreground">Invalidate current links and generate a new one.</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={isResettingInviteCode}
            onClick={handleResetInviteCode}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Link
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-destructive/10">
          <div className="flex flex-col">
            <h4 className="font-medium text-destructive">Delete Workspace</h4>
            <p className="text-sm text-destructive/80">Permanently remove this workspace and all its data.</p>
          </div>
          <Button
            size="sm"
            variant="destructive"
            disabled={isDeletingWorkspace}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};