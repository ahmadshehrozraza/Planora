"use client";

import { Fragment, useState, useMemo } from "react";
import { format } from "date-fns";
import { 
    MoreVertical, 
    Crown, 
    User, 
    Trash2, 
    Briefcase, 
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
    CardHeader,
    CardTitle,
    CardDescription
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

export const MembersList = () => {
    const workspaceId = useWorkspaceId();
    const [ConfirmDialog, confirm] = useConfirm(
        "Remove member",
        "Are you sure you want to remove this member from the workspace?",
        "destructive"
    );

    const [memberToDelete, setMemberToDelete] = useState<{id: string, name: string} | null>(null);

    if (!workspaceId) return null;

    const { data, isLoading } = useGetWorkspaceMembers(workspaceId);
    const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();
    const { mutate: deleteMember, isPending: isDeletingMember } = useDeleteMember();

    const handleUpdateMember = (memberId: string, role: MemberRole) => {
        // updateMember({ json: { role }, param: { memberId } });
        console.log(`Updating ${memberId} to ${role}`);
    };

    const handleDeleteMember = async (memberId: string, memberName: string) => {
        const ok = await confirm();
        if (!ok) return;
        
        console.log(`Deleting member: ${memberId}`);
    };

    const adminCount = data?.documents?.filter(m => m.role === MemberRole.ADMIN).length || 0;
    
    const isOnlyAdmin = (memberRole: MemberRole) => {
        return memberRole === MemberRole.ADMIN && adminCount === 1;
    };

    const getRoleBadge = (role: MemberRole) => {
        switch (role) {
            case MemberRole.ADMIN:
                return (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
                        <Crown className="size-3 mr-1" /> Admin
                    </Badge>
                );
            case MemberRole.PROJECT_MANAGER:
                return (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                        <Briefcase className="size-3 mr-1" /> Manager
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200">
                        <User className="size-3 mr-1" /> Member
                    </Badge>
                );
        }
    };

    if (isLoading) return <PageLoader />;

    if (!data?.documents?.length) {
        return (
            <Card className="w-full border-dashed shadow-none bg-slate-50/50">
                <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="size-14 rounded-full bg-white border flex items-center justify-center mb-4 shadow-sm">
                        <User className="size-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Team is empty</h3>
                    <p className="text-sm text-slate-500 max-w-sm mt-1">
                        Add members to your workspace to start collaborating on projects.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 w-full">
            <ConfirmDialog />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{workspaceId}</h2>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium bg-white p-1.5 rounded-lg border shadow-sm">
                    <div className="px-3 py-1 rounded-md bg-purple-50 text-purple-700">
                        {adminCount} Admins
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="px-3 py-1 text-slate-600">
                        {data.total} Total Members
                    </div>
                </div>
            </div>

            <Separator className="bg-slate-200" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.documents.map((member) => {
                    const isLastAdmin = isOnlyAdmin(member.role);
                    
                    return (
                        <div 
                            key={member.id} 
                            className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300 flex flex-col items-center p-6 text-center"
                        >
                            <div className="absolute top-3 right-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full"
                                        >
                                            <MoreVertical className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                        <DropdownMenuLabel className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                                            Change Role
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup 
                                            value={member.role} 
                                            onValueChange={(val) => handleUpdateMember(member.id, val as MemberRole)}
                                        >
                                            <DropdownMenuRadioItem 
                                                value={MemberRole.ADMIN}
                                                disabled={isUpdatingMember || isLastAdmin}
                                                className="cursor-pointer"
                                            >
                                                Administrator
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem 
                                                value={MemberRole.PROJECT_MANAGER}
                                                disabled={isUpdatingMember}
                                                className="cursor-pointer"
                                            >
                                                Project Manager
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem 
                                                value={MemberRole.MEMBER}
                                                disabled={isUpdatingMember || isLastAdmin}
                                                className="cursor-pointer"
                                            >
                                                Member
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem 
                                            className={`text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer ${isLastAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => !isLastAdmin && handleDeleteMember(member.id, member.memberId)}
                                            disabled={isDeletingMember || isLastAdmin}
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
                                    className="size-20 text-xl border-4 border-slate-50 shadow-sm"
                                    fallbackClassname="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600"
                                    isActive={member.hasAccess}
                                />
                                {member.role === MemberRole.ADMIN && (
                                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border shadow-sm" title="Admin">
                                        <Crown className="size-3.5 text-purple-600 fill-purple-100" />
                                    </div>
                                )}
                            </div>

                            <div className="w-full mb-4">
                                <h3 className="font-bold text-slate-900 text-lg truncate px-2">
                                    {member.memberId}
                                </h3>
                                <div className="flex items-center justify-center gap-1.5 mt-1 text-slate-500 text-xs">
                                    <Mail className="size-3" />
                                    <span className="truncate max-w-[150px]">{member.memberId}@example.com</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                {getRoleBadge(member.role)}
                            </div>

                            <div className="w-full pt-4 border-t border-slate-100 mt-auto flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Calendar className="size-3.5" />
                                    <span>Joined: {format(new Date(member.joinedDate), 'MMM yyyy')}</span>
                                </div>
                                
                                {!member.hasAccess && (
                                    <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                        <ShieldAlert className="size-3" />
                                        <span>Revoked</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};