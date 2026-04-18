"use client";

import React, { useMemo, useState, useEffect } from "react";
import { 
  Mail, Calendar, Briefcase, CheckCircle2, 
  AlertOctagon, TrendingUp, Target, Shield, Trash2, Plus 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  PieChart, Pie, Label 
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PageLoader } from "@/components/page-loader";
import { useConfirm } from "@/hooks/use-confirm";

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { useGetWorkspaceMemberProfile } from "@/features/members/api/use-get-workspace-member-profile";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { MemberRole } from "@/features/members/types";
import { useAddProjectMember } from "@/features/projects/api/use-add-project-member";
import { toast } from "sonner";

const effortConfig = {
  points: { label: "Effort Points", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

interface MemberProfileClientProps {
  memberId: string; 
  workspaceId: string;
}

export const MemberProfileClient = ({ memberId, workspaceId }: MemberProfileClientProps) => {

  const { data: member, isLoading } = useGetWorkspaceMemberProfile({ workspaceId, memberId });
  const { mutate: addProjectMember, isPending: isAddingToProject } = useAddProjectMember();

  const { mutate: updateRole, isPending: isUpdating } = useUpdateMember();
  const { mutate: removeMember, isPending: isDeleting } = useDeleteMember();
  
  const [ConfirmDialog, confirm] = useConfirm(
    "Remove member",
    "Are you sure you want to remove this member from the workspace? They will lose access to all projects.",
    "destructive"
  );

  const [role, setRole] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");

  useEffect(() => {
    if (member?.role) setRole(member.role);
  }, [member?.role]);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    updateRole({ memberId, role: newRole as MemberRole });
  };

  const handleDeleteMember = async () => {
    const ok = await confirm();
    if (!ok) return;
    removeMember({ memberId });
  };

  const handleAddToProject = () => {
    if (!selectedProject || !member?.userId) return;

    addProjectMember(
      { 
        projectId: selectedProject, 
        userId: member.userId 
      },
      {
        onSuccess: () => {
          setSelectedProject("");
          
        }
      }
    );
  };

  const dynamicStatusConfig = useMemo(() => {
    if (!member?.taskStatusData) return {};
    const config: Record<string, any> = {};
    member.taskStatusData.forEach((item: any) => {
      config[item.status.toLowerCase().replace(/\s+/g, '_')] = { label: item.status, color: item.fill };
    });
    return config as ChartConfig;
  }, [member?.taskStatusData]);

  if (isLoading || !member) return <div className="h-screen flex items-center justify-center"><PageLoader /></div>;

  return (
    <div className="w-full flex flex-col space-y-6 pb-8 text-foreground">
      <ConfirmDialog />
      
      <Card className="border-border shadow-sm bg-card">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <MemberAvatar 
            name={member.name} 
            src={member.image}
            className="size-20 sm:size-24 text-3xl border shadow-sm"
          />
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{member.name}</h1>
              <Badge variant="secondary" className="uppercase tracking-wider text-xs">
                {role.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground font-medium mb-4 sm:mb-0">
              <span className="flex items-center gap-1.5">
                <Mail className="size-4" /> {member.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" /> Joined {new Date(member.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5 text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                <TrendingUp className="size-4" /> Lifetime Points: {member.totalPointsEarned}
              </span>
            </div>
          </div>
          <div className="w-full sm:w-auto flex justify-center sm:justify-end shrink-0 mt-2 sm:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shadow-sm" disabled={isUpdating || isDeleting}>
                  <Shield className="size-4 mr-2" />
                  Manage Access
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Change Role
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={role} onValueChange={handleRoleChange}>
                  <DropdownMenuRadioItem value="ADMIN" className="cursor-pointer font-medium">Administrator</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="MEMBER" className="cursor-pointer font-medium">Member</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDeleteMember}
                  className="text-destructive font-medium focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <Trash2 className="size-4 mr-2" />
                  Remove Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Assigned</p>
                <p className="text-3xl font-bold">{member.kpis.totalTasksAssigned}</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Briefcase className="size-5" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tasks Done</p>
                <p className="text-3xl font-bold">{member.kpis.tasksCompleted}</p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><CheckCircle2 className="size-5" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-3xl font-bold text-destructive">{member.kpis.overdueTasks}</p>
              </div>
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><AlertOctagon className="size-5" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                <p className="text-3xl font-bold text-primary">{member.kpis.efficiency}%</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Target className="size-5" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 shadow-sm border-border flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle>Workload Breakdown</CardTitle>
            <CardDescription>Current status of all assigned tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4 flex items-center justify-center">
            <ChartContainer config={dynamicStatusConfig} className="w-full aspect-square max-h-[220px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={member.taskStatusData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={55}
                  strokeWidth={3}
                  stroke="var(--background)"
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                              {member.kpis.totalTasksAssigned}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs font-medium">
                              Tasks
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border flex flex-col">
          <CardHeader>
            <CardTitle>Weekly Effort Delivery</CardTitle>
            <CardDescription>Points earned over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
             <ChartContainer config={effortConfig} className="w-full h-[220px]">
              <BarChart accessibilityLayer data={member.weeklyEffortData} margin={{ top: 10, left: -20, right: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip cursor={{ fill: "var(--theme-muted)", opacity: 0.2 }} content={<ChartTooltipContent />} />
                <Bar dataKey="points" fill="var(--color-points)" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Project Involvements</CardTitle>
            <CardDescription>Performance breakdown across active and past projects.</CardDescription>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-[200px] h-9 shadow-sm">
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                {member.availableProjectsToAdd.length > 0 ? member.availableProjectsToAdd.map((proj: any) => (
                  <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                )) : <SelectItem value="none" disabled>No projects available</SelectItem>}
              </SelectContent>
            </Select>
            <Button onClick={handleAddToProject} disabled={!selectedProject} size="sm" className="h-9 shadow-sm">
              <Plus className="size-4 mr-1.5" /> Add
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-muted-foreground">Project Name</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground">Project Role</th>
                  <th className="px-6 py-4 text-center font-semibold text-muted-foreground">Tasks Progress</th>
                  <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Points Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {member.projects.length > 0 ? member.projects.map((project: any) => (
                  <tr key={project.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">{project.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant={project.status === "ACTIVE" ? "default" : "secondary"}>{project.status.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">{project.roleInProject.replace(/_/g, " ")}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold w-8 text-right">
                          {project.tasksAssigned > 0 ? Math.round((project.tasksCompleted / project.tasksAssigned) * 100) : 0}%
                        </span>
                        <Progress value={project.tasksAssigned > 0 ? (project.tasksCompleted / project.tasksAssigned) * 100 : 0} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-12">{project.tasksCompleted}/{project.tasksAssigned}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">{project.pointsEarned} pts</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="py-12 text-center text-muted-foreground font-medium">Not involved in any projects yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};