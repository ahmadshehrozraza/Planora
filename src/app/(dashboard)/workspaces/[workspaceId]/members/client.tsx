"use client";

import React, { useMemo, useCallback } from "react";
import { Crown, User, CopyIcon, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaceMembers } from "@/features/workspaces/api/use-get-workspace-members";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace"; 
import { useResetInviteCode } from "@/features/workspaces/api/use-reset-invite-code";
import { MemberRole } from "@/features/members/types";
import { useConfirm } from "@/hooks/use-confirm";
import { PageLoader } from "@/components/page-loader";
import { MemberCard } from "@/features/workspaces/components/member-card"; 
import Link from "next/link";

export const WorkspaceMembersClient = () => {
    const workspaceId = useWorkspaceId();
    const [ConfirmDialog, confirm] = useConfirm(
        "Remove member",
        "Are you sure you want to remove this member from the workspace? They will lose access to all projects.",
        "destructive"
    );

    const { data: membersData, isLoading } = useGetWorkspaceMembers(workspaceId);

    const { data: workspaceData } = useGetWorkspace({ workspaceId }); 
    const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();
    const { mutate: deleteMember, isPending: isDeletingMember } = useDeleteMember();
    const { mutate: resetInviteCode, isPending: isResetting } = useResetInviteCode();

    const handleUpdateMember = useCallback((memberId: string, role: MemberRole) => {
        updateMember({ memberId, role }); 
    }, [updateMember]);

    const handleDeleteMember = useCallback(async (memberId: string, memberName: string) => {
        const ok = await confirm();
        if (!ok) return;
        deleteMember({ memberId }); 
    }, [confirm, deleteMember]);

    const handleResetInviteCode = () => {
        if(workspaceId) resetInviteCode({ workspaceId });
    };

    const fullInviteLink = workspaceData?.inviteCode 
        ? `${window.location.origin}/workspaces/${workspaceId}/join/${workspaceData.inviteCode}` 
        : "";

    const handleCopyInviteLink = () => {
        if (!fullInviteLink) return;
        navigator.clipboard.writeText(fullInviteLink)
            .then(() => toast.success("Invite link copied to the clipboard"));
    };

    const adminCount = useMemo(() => {
        return membersData?.data?.filter(m => m.role === "ADMIN").length || 0;
    }, [membersData?.data]);
    
    const isOnlyAdmin = useCallback((memberRole: string) => {
        return memberRole === "ADMIN" && adminCount === 1;
    }, [adminCount]);

    if (!workspaceId) return null;
    if (isLoading) return <div className="h-64 flex items-center justify-center"><PageLoader /></div>;

    if (!membersData?.data?.length) {
        return (
            <Card className="w-full border border-dashed border-border shadow-sm bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="size-16 rounded-full bg-background border border-border flex items-center justify-center mb-5 shadow-sm">
                        <User className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Your team is empty</h3>
                    <p className="text-sm text-muted-foreground max-w-md mt-2 leading-relaxed">
                        Add members to your workspace to start collaborating on projects, assigning tasks, and tracking progress.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 w-full pb-8">
            <ConfirmDialog />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                
                <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="px-3 py-1.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 flex items-center gap-1.5 border border-purple-200 dark:border-purple-500/20">
                        <Crown className="size-3.5" />
                        {adminCount} {adminCount === 1 ? 'Admin' : 'Admins'}
                    </div>
                    <Separator orientation="vertical" className="h-5 bg-border" />
                    <div className="px-3 py-1.5 text-muted-foreground flex items-center gap-1.5">
                        <User className="size-3.5" />
                        {membersData.total} Total Members
                    </div>
                </div>

                <div className="flex items-center gap-2 lg:w-[700px]">
                    <div className="relative flex-1 ">
                        <Input 
                            readOnly 
                            value={fullInviteLink} 
                            placeholder="Loading invite link..."
                            className="  h-9 bg-muted/50 text-xs text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0" 
                        />
                    </div>
                    <Button
                        onClick={handleCopyInviteLink}
                        variant="secondary"
                        size="sm"
                        className="h-9 px-3 shrink-0"
                        title="Copy Link"
                    >
                        <CopyIcon className="size-4" />
                    </Button>
                    <Button
                        onClick={handleResetInviteCode}
                        disabled={isResetting}
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 shrink-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                        title="Reset Invite Link"
                    >
                        <RefreshCcw className={`size-4 ${isResetting ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {membersData.data.map((member) => (
                    <Link key={member.id} href={`/workspaces/${workspaceId}/members/${member.id}`}>
                        <MemberCard 
                            member={member}
                            isLastAdmin={isOnlyAdmin(member.role)}
                            isUpdating={isUpdatingMember}
                            isDeleting={isDeletingMember}
                            onUpdateRole={handleUpdateMember}
                            onDelete={handleDeleteMember}
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
};