"use client";

import React, { useMemo, useState } from "react";
import { Search, User, Crown, PlusIcon, CopyIcon, RefreshCcw, LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetProjectMembers } from "@/features/projects/api/use-get-project-members";
import { useGetWorkspaceMembers } from "@/features/workspaces/api/use-get-workspace-members";
import { useGetProject } from "@/features/projects/api/use-get-project";

import { MemberAvatar } from "@/features/members/components/member-avatar";
import { PageLoader } from "@/components/page-loader";
import { useConfirm } from "@/hooks/use-confirm";

import { useAddProjectMember } from "@/features/projects/api/use-add-project-member";
import { useResetProjectInviteCode } from "@/features/projects/api/use-reset-project-invite-code"; 
import { useUpdateProjectMember } from "@/features/projects/api/use-update-project-member";
import { useDeleteProjectMember } from "../api/use-delete-project-member";

import { ProjectMemberCard } from "./project-member-card";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import Link from "next/link";

interface ProjectMembersProps {
  projectId: string;
}

export const ProjectMembers = ({ projectId }: ProjectMembersProps) => {
  const workspaceId = useWorkspaceId();
  const { data: permissions } = useGetPermissions(workspaceId, projectId);
  
  const isWorkspaceAdmin = permissions?.workspaceAdmin || false;
  const isProjectManager = permissions?.projectManager || false;
  
  const canInviteByLink = isWorkspaceAdmin || isProjectManager;

  const [ConfirmDialog, confirm] = useConfirm(
    "Remove member",
    "Are you sure you want to remove this member from the project?",
    "destructive"
  );

  const [ResetDialog, confirmReset] = useConfirm(
    "Reset Invite Link",
    "This will invalidate the current invite link. Continue?",
    "destructive"
  );
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedWorkspaceMember, setSelectedWorkspaceMember] = useState("");

  const { data: projectData } = useGetProject({ projectId });
  const { data: projectMembersData, isLoading } = useGetProjectMembers({ projectId });
  const { data: workspaceMembersData } = useGetWorkspaceMembers(workspaceId);
  
  const { mutate: addProjectMember, isPending: isAddingMember } = useAddProjectMember();
  const { mutate: resetInviteCode, isPending: isResettingLink } = useResetProjectInviteCode(); 
  const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateProjectMember();
  const { mutate: removeMember, isPending: isDeletingMember } = useDeleteProjectMember();

  const members = projectMembersData?.data || [];
  const workspaceMembers = workspaceMembersData?.data || [];
  const inviteCode = projectData?.inviteCode || "";
  const fullInviteLink = inviteCode ? `${window.location.origin}/workspaces/${workspaceId}/projects/${projectId}/join/${inviteCode}` : "";

  const handleAction = async (id: string, type: "delete" | "update", role?: string) => {
    if (type === "delete") {
      const ok = await confirm();
      if (!ok) return;
      removeMember({ projectId, memberId: id }, { onSuccess: () => toast.success("Member removed") });
    } else if (type === "update" && role) {
      updateMember({ projectId, memberId: id, role }, { onSuccess: () => toast.success("Role updated") });
    }
  };

  const filteredMembers = useMemo(() => {
    const searchFiltered = members.filter((m: any) => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return searchFiltered.sort((a: any, b: any) => {
      const getPriority = (m: any) => {
        if (m.workspaceRole === "ADMIN") return 1;
        if (m.role === "PROJECT_MANAGER") return 2;
        return 3;
      };
      return getPriority(a) - getPriority(b);
    });
  }, [members, searchQuery]);

  const managerCount = members.filter((m: any) => m.role === "PROJECT_MANAGER" || m.workspaceRole === "ADMIN").length;

  const availableWorkspaceMembers = workspaceMembers.filter((wm: any) => {
    const wmId = wm.userId || wm.user?.id;
    return !members.some((pm: any) => pm.userId === wmId);
  });

  if (isLoading) return <div className="h-64 flex items-center justify-center"><PageLoader /></div>;

  return (
    <div className="space-y-6 w-full pb-8">
      <ConfirmDialog />
      <ResetDialog />

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2"><LinkIcon className="size-4" /> Invite Link</label>
              <div className="flex items-center gap-2">
                <Input readOnly value={fullInviteLink} className="h-9 bg-muted/50 text-xs" />
                <Button onClick={() => { navigator.clipboard.writeText(fullInviteLink); toast.success("Copied!"); }} variant="secondary" size="sm" className="h-9 px-3 shrink-0"><CopyIcon className="size-4" /></Button>
                {isWorkspaceAdmin && (
                  <Button variant="outline" size="sm" onClick={async () => { if (await confirmReset()) resetInviteCode({ projectId, workspaceId }); }} className="text-destructive h-9 shrink-0"><RefreshCcw className={`size-4 ${isResettingLink ? "animate-spin" : ""}`} /></Button>
                )}
              </div>
            </div>

            {isWorkspaceAdmin && (
              <>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><User className="size-4" /> Workspace Members</label>
                  <div className="flex items-center gap-2">
                    <Select value={selectedWorkspaceMember} onValueChange={setSelectedWorkspaceMember}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select member..." /></SelectTrigger>
                      <SelectContent>
                        {availableWorkspaceMembers.map((wm: any) => (
                          <SelectItem key={wm.id} value={wm.userId || wm.user?.id}>
                            <div className="flex items-center gap-2">
                              <MemberAvatar name={wm.user?.name || wm.name} src={wm.user?.image || wm.imageUrl || undefined} className="size-5" />
                              <span>{wm.user?.name || wm.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" className="h-9" disabled={!selectedWorkspaceMember || isAddingMember} onClick={() => addProjectMember({ projectId, userId: selectedWorkspaceMember }, { onSuccess: () => { setIsAddModalOpen(false); setSelectedWorkspaceMember(""); toast.success("Member added"); } })}>
                      Add
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-x-2 px-3 py-1.5 rounded-md bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 shrink-0">
            <Crown className="size-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 whitespace-nowrap">
              {managerCount} {managerCount === 1 ? 'Manager/Owner' : 'Managers/Owners'}
            </span>
          </div>
          <div className="flex items-center gap-x-2 px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/20 shrink-0">
            <User className="size-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {members.length} {members.length === 1 ? 'Member' : 'Total Members'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:w-[400px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-9 h-9" />
          </div>
          {canInviteByLink && (
            <Button size="sm" className="h-9" onClick={() => setIsAddModalOpen(true)}><PlusIcon className="size-4 mr-2" /> Add</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.map((member: any) => (
          <Link key={member.id} href={`${projectId}/project-member/${member.id}`}>
          <ProjectMemberCard 
            key={member.id} 
            member={member} 
            isAdmin={isWorkspaceAdmin} 
            disabled={isUpdatingMember || isDeletingMember}
            onAction={handleAction}
            onClick={() => {}} 
          />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProjectMembers;