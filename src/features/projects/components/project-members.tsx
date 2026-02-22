"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  Crown,
  Trash2,
  Calendar,
  Mail,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { FcInvite } from "react-icons/fc";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

import { useGetProjectMembers } from "@/features/projects/api/use-get-dummy-project-members";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { PageLoader } from "@/components/page-loader";
import { MemberRole } from "@/features/members/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

export const ProjectMembers = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const router = useRouter();

  const { data, isLoading } = useGetProjectMembers(projectId || "project_001");
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) return <PageLoader />;

  const members = data?.documents || [];

  const filteredMembers = members.filter((member: any) =>
    member.memberId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleMemberClick = (memberId: string) => {
    router.push(
      `/workspaces/${workspaceId}/projects/${projectId}/project-member/${memberId}`,
    );
  };

  const handleRoleChange = (memberId: string, newRole: MemberRole) => {
    console.log(`Updating member ${memberId} to role: ${newRole}`);
  };

  const handleRemoveMember = (memberId: string) => {
    console.log(`Removing member ${memberId}`);
  };

  return (
    <div className="space-y-6 w-full pb-8">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              className="pl-9 h-10 bg-card border-border focus-visible:ring-primary shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm font-medium bg-card px-3 py-2 rounded-md border border-border shadow-sm">
            <User className="size-4 text-muted-foreground" />
            <span>{filteredMembers.length} Members</span>
          </div>
          <Button className="shadow-sm h-10 w-full md:w-auto" size="sm">
            <FcInvite className="size-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member: any) => {
            const totalTasks = Math.floor(Math.random() * 20) + 5;
            const completedTasks = Math.floor(Math.random() * totalTasks);
            const progressVal = Math.round((completedTasks / totalTasks) * 100);

            return (
              <div 
                key={member.id}
                onClick={() => handleMemberClick(member.id)}
                className="group relative bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/30 flex flex-col items-center p-6 text-center cursor-pointer"
              >
                <div 
                  className="absolute top-3 right-3" 
                  onClick={(e) => e.stopPropagation()} 
                >
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
                    <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border">
                      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Project Role
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup 
                        value={member.role} 
                        onValueChange={(val) => handleRoleChange(member.id, val as MemberRole)}
                      >
                        <DropdownMenuRadioItem value={MemberRole.ADMIN} className="cursor-pointer font-medium">
                          Administrator
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value={MemberRole.PROJECT_MANAGER} className="cursor-pointer font-medium">
                          Project Manager
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value={MemberRole.MEMBER} className="cursor-pointer font-medium">
                          Member
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem 
                        className="text-destructive font-medium focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Remove from Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mb-4 relative">
                  <MemberAvatar 
                    name={member.memberId}
                    className="size-20 text-2xl border-4 border-background shadow-sm ring-1 ring-border"
                  />
                  {member.role === MemberRole.ADMIN && (
                    <div className="absolute -bottom-1 -right-1 bg-background p-1.5 rounded-full border border-border shadow-sm" title="Project Admin">
                      <Crown className="size-4 text-purple-500 fill-purple-100 dark:fill-purple-900/50" />
                    </div>
                  )}
                </div>

                <div className="w-full mb-4">
                  <h3 className="font-bold text-foreground text-lg truncate px-2 group-hover:text-primary transition-colors">
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

                <div className="w-full bg-muted/40 rounded-lg p-3 mb-5 border border-border/50">
                  <div className="flex justify-between items-center text-xs font-semibold mb-2">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <CheckCircle2 className="size-3.5" /> Tasks
                    </span>
                    <span className="text-foreground">{completedTasks} / {totalTasks}</span>
                  </div>
                  <Progress value={progressVal} className="h-1.5" />
                </div>

                <div className="w-full pt-4 border-t border-border mt-auto flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="size-3.5" />
                    <span>Joined {format(new Date(member.joinedDate || new Date()), 'MMM yyyy')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="w-full border border-dashed border-border shadow-sm bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-16 rounded-full bg-background border border-border flex items-center justify-center mb-5 shadow-sm">
              <User className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No members found</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-2 leading-relaxed">
              We couldn't find anyone matching "{searchQuery}". Try a different name or invite a new member.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectMembers;