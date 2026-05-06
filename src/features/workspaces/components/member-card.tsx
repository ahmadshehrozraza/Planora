"use client";

import React from "react";
import { format } from "date-fns";
import { 
    MoreVertical, 
    Crown, 
    Trash2, 
    Calendar,
    Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

import { MemberAvatar } from "@/features/members/components/member-avatar";

interface MemberCardProps {
    member: any; 
    customRoles: any[];
    canManage: boolean;
    isLastOwner: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    onUpdateRole: (memberId: string, roleId: string) => void;
    onDelete: (memberId: string, memberName: string) => void;
}

export const MemberCard = React.memo(({ 
    member, 
    customRoles,
    canManage,
    isLastOwner, 
    isUpdating, 
    isDeleting, 
    onUpdateRole, 
    onDelete 
}: MemberCardProps) => {
    
    const roleName = member.role?.name || "Unknown";
    const isOwner = member.role?.permissions?.includes("WORKSPACE_DELETE");

    return (
        <div className="group relative bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/30 flex flex-col items-center p-6 text-center h-full">
            
            {canManage && (
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
                                value={member.role?.id} 
                                onValueChange={(val) => onUpdateRole(member.id, val)}
                            >
                                {customRoles?.map((role) => (
                                    <DropdownMenuRadioItem 
                                        key={role.id}
                                        value={role.id}
                                        disabled={isUpdating || isLastOwner}
                                        className="cursor-pointer font-medium focus:bg-accent focus:text-accent-foreground"
                                    >
                                        {role.name}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>

                            <DropdownMenuSeparator className="bg-border" />

                            <DropdownMenuItem 
                                className={`font-medium ${isLastOwner ? 'text-muted-foreground opacity-50 cursor-not-allowed' : 'text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (!isLastOwner) onDelete(member.id, member.name);
                                }}
                                disabled={isDeleting || isLastOwner}
                            >
                                <Trash2 className="size-4 mr-2" />
                                Remove from workspace
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <div className="mb-4 relative mt-2">
                <MemberAvatar 
                    name={member.name}
                    src={member.imageUrl}
                    className="size-20 text-2xl border-4 border-background shadow-sm ring-1 ring-border"
                />
                {isOwner && (
                    <div className="absolute -bottom-1 -right-1 bg-background p-1.5 rounded-full border border-border shadow-sm" title="Workspace Owner">
                        <Crown className="size-4 text-purple-500 fill-purple-100 dark:fill-purple-900/50" />
                    </div>
                )}
            </div>

            <div className="w-full mb-4">
                <h3 className="font-bold text-foreground text-lg truncate px-2">
                    {member.name}
                </h3>
                <div className="flex items-center justify-center gap-1.5 mt-1 text-muted-foreground text-xs">
                    <Mail className="size-3.5" />
                    <span className="truncate max-w-[150px] font-medium">{member.email}</span>
                </div>
            </div>

            <div className="mb-6">
                <Badge variant="secondary" className="uppercase tracking-wider text-[10px] px-2.5 py-0.5">
                    {roleName}
                </Badge>
            </div>

            <div className="w-full pt-4 border-t border-border mt-auto flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="size-3.5" />
                    <span>Joined: {member.createdAt ? format(new Date(member.createdAt), 'MMM yyyy') : 'N/A'}</span>
                </div>
            </div>
        </div>
    );
});

MemberCard.displayName = "MemberCard";