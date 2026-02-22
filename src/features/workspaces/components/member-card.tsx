"use client";

import React from "react";
import { format } from "date-fns";
import { 
    MoreVertical, 
    Crown, 
    Trash2, 
    Calendar,
    Mail,
    ShieldAlert
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

import { MemberRole } from "@/features/members/types";
import { MemberAvatar } from "@/features/members/components/member-avatar";

interface MemberCardProps {
    member: any; 
    isLastAdmin: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    onUpdateRole: (memberId: string, role: MemberRole) => void;
    onDelete: (memberId: string, memberName: string) => void;
}

export const MemberCard = React.memo(({ 
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
                <Badge variant={member.role as any} className="uppercase tracking-wider text-[10px] px-2.5 py-0.5">
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