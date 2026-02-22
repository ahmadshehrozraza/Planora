"use client";

import React, { useMemo, useCallback } from "react";
import { Crown, User } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import {
    Card,
    CardContent,
} from "@/components/ui/card";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaceMembers } from "@/features/members/api/use-get-dummy-members";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { MemberRole } from "@/features/members/types";
import { useConfirm } from "@/hooks/use-confirm";
import { PageLoader } from "@/components/page-loader";
import { MemberCard } from "@/features/workspaces/components/member-card"; 
import { Button } from "@/components/ui/button";
import { FcInvite } from "react-icons/fc";
import Link from "next/link";

export const MembersClient = () => {
    const workspaceId = useWorkspaceId();
    const [ConfirmDialog, confirm] = useConfirm(
        "Remove member",
        "Are you sure you want to remove this member from the workspace? They will lose access to all projects.",
        "destructive"
    );

    const { data, isLoading } = useGetWorkspaceMembers(workspaceId);
    const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();
    const { mutate: deleteMember, isPending: isDeletingMember } = useDeleteMember();

    const handleUpdateMember = useCallback((memberId: string, role: MemberRole) => {
        console.log(`Updating ${memberId} to ${role}`);
        // updateMember({ param: { memberId }, json: { role } }); 
    }, []);

    const handleDeleteMember = useCallback(async (memberId: string, memberName: string) => {
        const ok = await confirm();
        if (!ok) return;
        
        console.log(`Deleting member: ${memberId}`);
        // deleteMember({ param: { memberId } }); 
    }, [confirm]);

    const adminCount = useMemo(() => {
        return data?.documents?.filter(m => m.role === MemberRole.ADMIN).length || 0;
    }, [data?.documents]);
    
    const isOnlyAdmin = useCallback((memberRole: MemberRole) => {
        return memberRole === MemberRole.ADMIN && adminCount === 1;
    }, [adminCount]);

    if (!workspaceId) return null;
    if (isLoading) return <div className="h-64 flex items-center justify-center"><PageLoader /></div>;

    if (!data?.documents?.length) {
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
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div className="flex items-center gap-2 text-sm font-medium bg-card p-1.5 rounded-lg border border-border shadow-sm">
                    <div className="px-3 py-1.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 flex items-center gap-1.5 border border-purple-200 dark:border-purple-500/20">
                        <Crown className="size-3.5" />
                        {adminCount} {adminCount === 1 ? 'Admin' : 'Admins'}
                    </div>
                    <Separator orientation="vertical" className="h-5 bg-border" />
                    <div className="px-3 py-1.5 text-muted-foreground flex items-center gap-1.5">
                        <User className="size-3.5" />
                        {data.total} Total Members
                    </div>
                </div>

                <div>
                    <Button
                        variant={"default"}
                        >
                            <FcInvite />
                            Invite Members
                        </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.documents.map((member) => (
                    <Link href={`/workspaces/${workspaceId}/members/${member.id}`}>
                    <MemberCard 
                        key={member.id}
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