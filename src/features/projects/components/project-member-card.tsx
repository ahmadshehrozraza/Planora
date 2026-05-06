"use client";

import React from "react";
import { Crown, Trash2, Calendar, Mail, MoreVertical, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { dateFormatter } from "@/lib/utils";
import { PERMISSIONS } from "@/lib/permissions-constants";

interface ProjectMemberCardProps {
  member: any;
  projectRoles: any[];
  canManage: boolean;
  disabled: boolean;
  onAction: (id: string, type: "delete" | "update", roleId?: string) => void;
  onClick: (id: string) => void;
}

export const ProjectMemberCard = React.memo(({ 
  member, 
  projectRoles, 
  canManage, 
  disabled, 
  onAction, 
  onClick 
}: ProjectMemberCardProps) => {
  const progressVal = member.totalTasks > 0 ? Math.round((member.completedTasks / member.totalTasks) * 100) : 0;
  
  const roleName = member.role?.name || "Member";
  const roleId = member.role?.id;

  const isWorkspaceOwner = member.workspacePermissions?.includes(PERMISSIONS.WORKSPACE_DELETE);
  const isProjectAdmin = member.role?.permissions?.includes(PERMISSIONS.PROJECT_MANAGE_ROLES) || member.role?.permissions?.includes(PERMISSIONS.PROJECT_UPDATE);
  const isManager = isWorkspaceOwner || isProjectAdmin;
  
  const canBeManaged = canManage && !isWorkspaceOwner;

  return (
    <div 
      onClick={() => onClick(member.id)}
      className="group relative bg-card rounded-2xl border border-border p-6 text-center cursor-pointer hover:border-primary/30 transition-all shadow-sm flex flex-col h-full"
    >
      {canBeManaged && (
        <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={disabled} className="size-8 rounded-full">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Change Project Role
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup 
                value={roleId} 
                onValueChange={(val) => onAction(member.id, "update", val)}
              >
                {projectRoles?.map((role) => (
                    <DropdownMenuRadioItem 
                        key={role.id} 
                        value={role.id}
                        className="cursor-pointer font-medium"
                    >
                        {role.name}
                    </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive font-medium cursor-pointer focus:text-destructive focus:bg-destructive/10" 
                onClick={() => onAction(member.id, "delete")}
              >
                <Trash2 className="size-4 mr-2" /> Remove from Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="mb-4 relative inline-block mx-auto mt-2">
        <MemberAvatar name={member.name} src={member.image || undefined} className="size-20 border-4 border-background shadow-sm" />
        {isManager && (
          <div className="absolute -bottom-1 -right-1 bg-background p-1.5 rounded-full border shadow-sm">
            <Crown className={`size-4 ${isWorkspaceOwner ? "text-amber-500 fill-amber-50" : "text-purple-500 fill-purple-50"}`} />
          </div>
        )}
      </div>

      <h3 className="font-bold text-lg truncate px-2 group-hover:text-primary transition-colors">{member.name}</h3>
      <div className="flex items-center justify-center gap-1.5 mt-1 text-muted-foreground text-xs mb-3">
        <Mail className="size-3" />
        <span className="truncate max-w-[150px]">{member.email}</span>
      </div>

      <div className="mb-5 flex justify-center gap-2">
        {isWorkspaceOwner && (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 uppercase tracking-wider text-[9px] px-2 hover:bg-amber-500/10">
            Workspace Owner
          </Badge>
        )}
        <Badge variant="secondary" className="uppercase tracking-wider text-[9px] px-2">
          {roleName}
        </Badge>
      </div>

      <div className="w-full bg-muted/40 rounded-lg p-3 border border-border/50">
        <div className="flex justify-between items-center text-[11px] font-semibold mb-2">
          <span className="flex items-center gap-1 text-muted-foreground">
            <CheckCircle2 className="size-3" /> Tasks
          </span>
          <span className="text-foreground">{member.completedTasks} / {member.totalTasks}</span>
        </div>
        <Progress value={progressVal} className="h-1.5" />
      </div>

      <div className="w-full pt-4 border-t border-border mt-auto flex items-center justify-center text-[10px] font-medium text-muted-foreground gap-1.5">
        <Calendar className="size-3" />
        <span>Joined {dateFormatter(member.createdAt)}</span>
      </div>
    </div>
  )
});

ProjectMemberCard.displayName = "ProjectMemberCard";