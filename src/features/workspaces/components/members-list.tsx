"use client";

import React, { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { 
    MoreVertical, 
    Crown, 
    User, 
    Trash2, 
    Calendar,
    Mail,
    ShieldAlert
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useGetWorkspaceMembers } from "@/features/members/api/use-get-dummy-members";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { MemberRole } from "@/features/members/types";
import { useConfirm } from "@/hooks/use-confirm";
import { PageLoader } from "@/components/page-loader";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { cn } from "@/lib/utils";

interface MemberCardProps {
    member: any; 
    isLastAdmin: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    onUpdateRole: (memberId: string, role: MemberRole) => void;
    onDelete: (memberId: string, memberName: string) => void;
}

const MemberCard = React.memo(({ 
    member, 
    isLastAdmin, 
    isUpdating, 
    isDeleting, 
    onUpdateRole, 
    onDelete 
}: MemberCardProps) => {
    return (
        <div className="group relative bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/30 flex flex-col items-center p-6 text-center">
            
            <div className="absolute top-3 right-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
                        >
                            <MoreVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border bg-popover">
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Change Role
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuRadioGroup 
                            value={member.role} 
                            onValueChange={(val) => onUpdateRole(member.id, val as MemberRole)}
                        >
                            <DropdownMenuRadioItem 
                                value={MemberRole.ADMIN}
                                disabled={isUpdating || isLastAdmin}
                                className="cursor-pointer font-medium focus:bg-accent focus:text-accent-foreground"
                            >
                                Administrator
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem 
                                value={MemberRole.PROJECT_MANAGER}
                                disabled={isUpdating}
                                className="cursor-pointer font-medium focus:bg-accent focus:text-accent-foreground"
                            >
                                Project Manager
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem 
                                value={MemberRole.MEMBER}
                                disabled={isUpdating || isLastAdmin}
                                className="cursor-pointer font-medium focus:bg-accent focus:text-accent-foreground"
                            >
                                Member
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>

                        <DropdownMenuSeparator className="bg-border" />

                        <DropdownMenuItem 
                            className={`text-destructive font-medium focus:text-destructive focus:bg-destructive/10 cursor-pointer ${isLastAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => !isLastAdmin && onDelete(member.id, member.memberId)}
                            disabled={isDeleting || isLastAdmin}
                        >
                            <Trash2 className="size-4 mr-2" />
                            Remove from workspace
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="mb-4 relative">
                <MemberAvatar 
                    name={member.memberId}
                    className="size-20 text-2xl border-4 border-background shadow-sm ring-1 ring-border"
                    // fallbackClassname="bg-gradient-to-br from-primary/10 to-primary/30 text-primary-foreground font-semibold"
                    isActive={member.hasAccess}
                />
                {member.role === MemberRole.ADMIN && (
                    <div className="absolute -bottom-1 -right-1 bg-background p-1.5 rounded-full border border-border shadow-sm" title="Workspace Admin">
                        <Crown className="size-4 text-purple-500 fill-purple-100 dark:fill-purple-900/50" />
                    </div>
                )}
            </div>

            <div className="w-full mb-4">
                <h3 className="font-bold text-foreground text-lg truncate px-2">
                    {member.memberId}
                </h3>
                <div className="flex items-center justify-center gap-1.5 mt-1 text-muted-foreground text-xs">
                    <Mail className="size-3.5" />
                    <span className="truncate max-w-[150px] font-medium">{member.memberId}@example.com</span>
                </div>
            </div>

            <div className="mb-6">
                <Badge variant={member.role} className="uppercase tracking-wider text-[10px] px-2.5 py-0.5">
                    {member.role.replace(/_/g, " ")}
                </Badge>
            </div>

            <div className="w-full pt-4 border-t border-border mt-auto flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="size-3.5" />
                    <span>Joined: {format(new Date(member.joinedDate), 'MMM yyyy')}</span>
                </div>
                
                {!member.hasAccess && (
                    <div className="flex items-center gap-1.5 text-destructive bg-destructive/10 px-2 py-1 rounded-full border border-destructive/20">
                        <ShieldAlert className="size-3.5" />
                        <span className="font-semibold">Revoked</span>
                    </div>
                )}
            </div>
        </div>
    );
});

MemberCard.displayName = "MemberCard";


export const MembersList = () => {
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
    }, []);

    const handleDeleteMember = useCallback(async (memberId: string, memberName: string) => {
        const ok = await confirm();
        if (!ok) return;
        
        console.log(`Deleting member: ${memberId}`);
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
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Workspace Members</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage roles and access for everyone in this workspace.</p>
                </div>
                
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.documents.map((member) => (
                    <MemberCard 
                        key={member.id}
                        member={member}
                        isLastAdmin={isOnlyAdmin(member.role)}
                        isUpdating={isUpdatingMember}
                        isDeleting={isDeletingMember}
                        onUpdateRole={handleUpdateMember}
                        onDelete={handleDeleteMember}
                    />
                ))}
            </div>
        </div>
    );
};