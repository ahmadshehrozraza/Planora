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

// 🚀 OPTIMIZATION 1: Separate MemberCard Component
// Isay alag component banaya aur React.memo use kiya taake ek member update ho to baaki re-render na hon.
interface MemberCardProps {
    member: any; // Replace 'any' with your actual Member type
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
        <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300 flex flex-col items-center p-6 text-center">
            
            <div className="absolute top-3 right-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <MoreVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-slate-200">
                        <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Change Role
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup 
                            value={member.role} 
                            onValueChange={(val) => onUpdateRole(member.id, val as MemberRole)}
                        >
                            <DropdownMenuRadioItem 
                                value={MemberRole.ADMIN}
                                disabled={isUpdating || isLastAdmin}
                                className="cursor-pointer font-medium"
                            >
                                Administrator
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem 
                                value={MemberRole.PROJECT_MANAGER}
                                disabled={isUpdating}
                                className="cursor-pointer font-medium"
                            >
                                Project Manager
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem 
                                value={MemberRole.MEMBER}
                                disabled={isUpdating || isLastAdmin}
                                className="cursor-pointer font-medium"
                            >
                                Member
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem 
                            className={`text-red-600 font-medium focus:text-red-700 focus:bg-red-50 cursor-pointer ${isLastAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    className="size-20 text-2xl border-4 border-white shadow-sm ring-1 ring-slate-100"
                    fallbackClassname="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-semibold"
                    isActive={member.hasAccess}
                />
                {member.role === MemberRole.ADMIN && (
                    <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full border border-slate-100 shadow-sm" title="Workspace Admin">
                        <Crown className="size-4 text-amber-500 fill-amber-100" />
                    </div>
                )}
            </div>

            <div className="w-full mb-4">
                <h3 className="font-bold text-slate-900 text-lg truncate px-2">
                    {member.memberId}
                </h3>
                <div className="flex items-center justify-center gap-1.5 mt-1 text-slate-500 text-xs">
                    <Mail className="size-3.5 text-slate-400" />
                    <span className="truncate max-w-[150px] font-medium">{member.memberId}@example.com</span>
                </div>
            </div>

            <div className="mb-6">
                <Badge variant={member.role} className="uppercase tracking-wider text-[10px] px-2.5 py-0.5">
                    {member.role.replace(/_/g, " ")}
                </Badge>
            </div>

            <div className="w-full pt-4 border-t border-slate-100 mt-auto flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="size-3.5 text-slate-400" />
                    <span>Joined: {format(new Date(member.joinedDate), 'MMM yyyy')}</span>
                </div>
                
                {!member.hasAccess && (
                    <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                        <ShieldAlert className="size-3.5" />
                        <span className="font-semibold">Revoked</span>
                    </div>
                )}
            </div>
        </div>
    );
});
MemberCard.displayName = "MemberCard";


// --- MAIN COMPONENT ---
export const MembersList = () => {
    const workspaceId = useWorkspaceId();
    const [ConfirmDialog, confirm] = useConfirm(
        "Remove member",
        "Are you sure you want to remove this member from the workspace? They will lose access to all projects.",
        "destructive"
    );

    // This state seems unused in your original code, removing it for cleanliness unless needed.
    // const [memberToDelete, setMemberToDelete] = useState<{id: string, name: string} | null>(null);

    const { data, isLoading } = useGetWorkspaceMembers(workspaceId);
    const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();
    const { mutate: deleteMember, isPending: isDeletingMember } = useDeleteMember();

    // 🚀 OPTIMIZATION 2: useCallback for handlers
    const handleUpdateMember = useCallback((memberId: string, role: MemberRole) => {
        console.log(`Updating ${memberId} to ${role}`);
        // updateMember({ id: memberId, role }); 
    }, [/* add updateMember if it's stable, or keep empty if from react-query */]);

    const handleDeleteMember = useCallback(async (memberId: string, memberName: string) => {
        const ok = await confirm();
        if (!ok) return;
        
        console.log(`Deleting member: ${memberId}`);
        // deleteMember({ id: memberId });
    }, [confirm]);

    // 🚀 OPTIMIZATION 3: useMemo for derived state
    const adminCount = useMemo(() => {
        return data?.documents?.filter(m => m.role === MemberRole.ADMIN).length || 0;
    }, [data?.documents]);
    
    // Memoize the check function or keep it simple
    const isOnlyAdmin = useCallback((memberRole: MemberRole) => {
        return memberRole === MemberRole.ADMIN && adminCount === 1;
    }, [adminCount]);


    if (!workspaceId) return null;
    if (isLoading) return <div className="h-64 flex items-center justify-center"><PageLoader /></div>;

    if (!data?.documents?.length) {
        return (
            <Card className="w-full border border-dashed shadow-sm bg-slate-50/50">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="size-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-5 shadow-sm">
                        <User className="size-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Your team is empty</h3>
                    <p className="text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
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
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Members</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage roles and access for everyone in this workspace.</p>
                </div>
                
                <div className="flex items-center gap-2 text-sm font-medium bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <div className="px-3 py-1.5 rounded-md bg-amber-50 text-amber-700 flex items-center gap-1.5 border border-amber-100">
                        <Crown className="size-3.5" />
                        {adminCount} {adminCount === 1 ? 'Admin' : 'Admins'}
                    </div>
                    <Separator orientation="vertical" className="h-5" />
                    <div className="px-3 py-1.5 text-slate-600 flex items-center gap-1.5">
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