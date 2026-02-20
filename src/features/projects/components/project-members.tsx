"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    MoreVertical, 
    Search, 
    Plus,
    Trash2, 
    Briefcase, 
    User, 
    Crown,
    ShieldCheck,
    CheckCircle2,
    Trophy,
    UserCog
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; 
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

import { useGetProjectMembers } from "@/features/projects/api/use-get-dummy-project-members"; 
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { PageLoader } from "@/components/page-loader";
import { MemberRole } from "@/features/members/types"; 
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { cn } from "@/lib/utils";

export const ProjectMembers = () => {
    const workspaceId = useWorkspaceId();
    const projectId = useProjectId();
    const router = useRouter(); 
    
    const { data, isLoading } = useGetProjectMembers(projectId || 'project_001');
    const [searchQuery, setSearchQuery] = useState("");

    if (isLoading) return <PageLoader />;
    
    const members = data?.documents || [];

    const filteredMembers = members.filter((member: any) => 
        member.memberId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    
    const handleMemberClick = (memberId: string) => {
        router.push(`/workspaces/${workspaceId}/projects/${projectId}/project-member/${memberId}`);
    };

    
    const handleRoleChange = (memberId: string, newRole: MemberRole) => {
        console.log(`Updating member ${memberId} to role: ${newRole}`);
       
    };

    const handleRemoveMember = (memberId: string) => {
        console.log(`Removing member ${memberId}`);
    };

    return (
        <Card className="w-full h-full border-none shadow-none bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between p-0 mb-6 space-y-0">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Project Team</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Monitor performance and manage roles for <b className="text-foreground">{members.length} members</b>.
                    </p>
                </div>
                <Button className="shadow-sm" size="sm">
                    <Plus className="size-4 mr-2" />
                    Add Member
                </Button>
            </CardHeader>

            <CardContent className="p-0">
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search member by name..." 
                                className="pl-9 h-9 bg-background border-border focus-visible:ring-ring"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-border">
                        {filteredMembers.length > 0 ? (
                            filteredMembers.map((member: any) => {
                                const assignedTasks = Math.floor(Math.random() * 20) + 5; 
                                const completedTasks = Math.floor(Math.random() * assignedTasks);
                                const totalPoints = assignedTasks * 5; 
                                const earnedPoints = completedTasks * 5; 
                                const progressPercentage = Math.round((earnedPoints / totalPoints) * 100);

                                return (
                                    <div 
                                        key={member.id}
                                        onClick={() => handleMemberClick(member.id)} 
                                        className="group grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors cursor-pointer"
                                    >
                                        <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                                            <MemberAvatar 
                                                name={member.memberId}
                                                className="size-12 rounded-full border-2 border-background shadow-sm"
                                                fallbackClassname="text-md font-bold bg-primary text-primary-foreground"
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm text-foreground truncate">
                                                        {member.memberId}
                                                    </span>
                                                    <Badge variant={member.role}>{member.role}</Badge>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <ShieldCheck className="size-3 text-emerald-500" />
                                                    <span>Active Contributor</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-1 md:col-span-3 flex flex-col gap-1.5 border-l px-4 border-border">
                                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                <CheckCircle2 className="size-3.5 text-muted-foreground" />
                                                Tasks Completion
                                            </p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-bold text-foreground">{completedTasks}</span>
                                                <span className="text-xs text-muted-foreground">/ {assignedTasks} tasks</span>
                                            </div>
                                        </div>

                                        <div className="col-span-1 md:col-span-4 flex flex-col gap-2 border-l px-4 border-border">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                                                    <Trophy className="size-3.5 text-amber-500" />
                                                    Effort Points
                                                </div>
                                                <span className="font-bold text-foreground">
                                                    {earnedPoints} <span className="text-muted-foreground font-normal">/ {totalPoints} pts</span>
                                                </span>
                                            </div>
                                            <div className="w-full">
                                                <Progress 
                                                    value={progressPercentage} 
                                                    className="h-2 bg-secondary" 
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-1 md:col-span-1 flex justify-end">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56">
                                                        <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <UserCog className="size-4 mr-2" />
                                                                Change Role
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuItem onClick={() => handleRoleChange(member.id, MemberRole.ADMIN)}>
                                                                    <Crown className="size-4 mr-2 text-purple-500" />
                                                                    Admin
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleRoleChange(member.id, MemberRole.PROJECT_MANAGER)}>
                                                                    <Briefcase className="size-4 mr-2 text-indigo-500" />
                                                                    Project Manager
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleRoleChange(member.id, MemberRole.MEMBER)}>
                                                                    <User className="size-4 mr-2 text-slate-500" />
                                                                    Member
                                                                </DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>

                                                        <DropdownMenuSeparator />
                                                        
                                                        <DropdownMenuItem 
                                                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                            onClick={() => handleRemoveMember(member.id)}
                                                        >
                                                            <Trash2 className="size-4 mr-2" />
                                                            Remove from Project
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-16 flex flex-col items-center justify-center text-center">
                                <div className="p-4 rounded-full bg-muted mb-3 border border-border">
                                    <User className="size-10 text-muted-foreground" />
                                </div>
                                <p className="text-lg font-semibold text-foreground">No members found</p>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                                    We couldn't find anyone matching "{searchQuery}". Try a different name.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProjectMembers;