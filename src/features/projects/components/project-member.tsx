"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, Briefcase, Mail, Layers, Trash2, Clock, ArrowLeft, 
  Shield, Activity, Target, AlertCircle
} from "lucide-react";
import { PieChart, Pie, Label, Cell } from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Badge } from "@/components/ui/badge";
import { MemberRole } from "@/features/members/types";
import { dateFormatter } from '@/components/date-indicator';
import { useConfirm } from "@/hooks/use-confirm";

import { useUpdateProjectMember } from "@/features/projects/api/use-update-project-member";
import { useDeleteProjectMember } from "@/features/projects/api/use-delete-project-member";
import { useProjectId } from '../hooks/use-project-id';

import { VelocityChart } from '@/components/velocity-chart';
import { VerticalBarChart } from '@/features/dashboard/components/vertical-bar-chart';

const contributionConfig = {
  member: { label: "This Member", color: "hsl(var(--primary))" },
  others: { label: "Rest of Team", color: "hsl(var(--muted))" },
} satisfies ChartConfig;

const cumulativeFlowConfig = {
  todo: { label: "To Do", color: "hsl(var(--chart-1))" },
  inProgress: { label: "In Progress", color: "hsl(var(--chart-2))" },
  done: { label: "Done", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

export default function ProjectMember({ memberInfo }: { memberInfo: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const projectId = useProjectId();

  const { 
    meta, stats, contribution, currentWork, 
    segments = [], tasks = [], velocityData = [] 
  } = memberInfo;

  const [role, setRole] = useState<string>(meta.role || "MEMBER");
  
  const [ConfirmDialog, confirm] = useConfirm(
    "Remove member",
    "Are you sure you want to remove this member from the project?",
    "destructive"
  );

  const { mutate: updateRole, isPending: isUpdating } = useUpdateProjectMember();
  const { mutate: deleteMember, isPending: isDeleting } = useDeleteProjectMember();

  useEffect(() => {
    if (meta.role) setRole(meta.role);
  }, [meta.role]);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    updateRole({ memberId: meta.memberId, role: newRole, projectId: projectId });
  };

  const handleRemoveMember = async () => {
    const ok = await confirm();
    if (!ok) return;
    deleteMember(
      { memberId: meta.memberId, projectId },
      { onSuccess: () => router.back() }
    );
  };

  const memberPoints = contribution.memberPoints || 0;
  const projectTotalPoints = contribution.projectTotalPoints || 1; 
  const restOfTeam = Math.max(0, projectTotalPoints - memberPoints);
  
  const contributionData = [
    { name: "This Member", value: memberPoints, fill: "var(--color-member)" },
    { name: "Rest of Team", value: restOfTeam, fill: "var(--color-others)" },
  ];
  const contributionPercent = Math.round((memberPoints / projectTotalPoints) * 100);

  const segmentChartData = useMemo(() => {
    return segments.map((s: any) => ({
      name: s.segmentName,
      progress: s.memberPointsAssigned > 0 ? Math.round((s.memberPointsEarned / s.memberPointsAssigned) * 100) : 0,
      status: s.segmentStatus
    }));
  }, [segments]);

  const mappedVelocityData = useMemo(() => {
    return velocityData.map((v: any) => ({
      date: v.day,
      created: 0,
      completed: v.points || 0
    }));
  }, [velocityData]);

  return (
    <div className="w-full flex flex-col space-y-6 pb-8 text-foreground">
      <ConfirmDialog />
      
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:bg-transparent hover:text-primary transition-colors">
          <ArrowLeft className="size-4 mr-2" />
          Back to Project Members
        </Button>
      </div>

      <Card className="border-border shadow-sm bg-card">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <MemberAvatar name={meta.userName} src={meta.image} className="size-20 sm:size-24 text-3xl border shadow-sm" isActive={meta.status === "Active"} />
          
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{meta.userName}</h1>
              <Badge variant="secondary" className="uppercase tracking-wider text-xs shadow-sm">
                {role.replace(/_/g, " ")}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground font-medium mb-4 sm:mb-0">
              <span className="flex items-center gap-1.5"><Briefcase className="size-4" /> {meta.projectName}</span>
              <span className="flex items-center gap-1.5"><Mail className="size-4" /> {meta.email || "No email"}</span>
              <span className="flex items-center gap-1.5"><Calendar className="size-4" /> Joined {dateFormatter(meta.joinedDate)}</span>
            </div>
          </div>

          <div className="w-full sm:w-auto flex justify-center sm:justify-end shrink-0 mt-2 sm:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shadow-sm" disabled={isUpdating || isDeleting}>
                  <Shield className="size-4 mr-2" /> Manage Access
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={role} onValueChange={handleRoleChange}>
                  <DropdownMenuRadioItem value={"PROJECT_MANAGER"} className="cursor-pointer font-medium">Project Manager</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={"MEMBER"} className="cursor-pointer font-medium">Member</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleRemoveMember} className="text-destructive font-medium cursor-pointer">
                  <Trash2 className="size-4 mr-2" /> Remove from Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-muted/50 border border-border h-10 w-full sm:w-auto flex justify-start overflow-x-auto no-scrollbar">
          <TabsTrigger value="overview" className="h-8 px-6 rounded-md">Overview</TabsTrigger>
          <TabsTrigger value="segments" className="h-8 px-6 rounded-md">Segments</TabsTrigger>
          <TabsTrigger value="tasks" className="h-8 px-6 rounded-md">Task History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <Card className="col-span-1 shadow-sm border-border bg-card flex flex-col">
              <CardHeader className="pb-0">
                <CardTitle className="text-base flex items-center gap-2"><Target className="size-4 text-primary" /> Project Contribution</CardTitle>
                <CardDescription>Value added to the total project effort.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4 flex items-center justify-center">
                <ChartContainer config={contributionConfig} className="w-full aspect-square max-h-[180px]">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie data={contributionData} dataKey="value" nameKey="name" innerRadius={55} strokeWidth={3} stroke="var(--background)">
                      {contributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">{contributionPercent}%</tspan>
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

            <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
              <Card className="shadow-sm border-border bg-card">
                <CardHeader className="bg-muted/30 border-b border-border pb-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2"><Clock className="size-4 text-primary" /> Active Focus & Stats</CardTitle>
                </CardHeader>
                <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1 border-r border-border pr-4">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Currently Working On</p>
                    <h3 className="text-lg font-bold text-foreground">{currentWork.activeTaskName || "No active task currently"}</h3>
                    {currentWork.activeSegmentName && <p className="text-sm text-muted-foreground font-medium">{currentWork.activeSegmentName}</p>}
                    {currentWork.activeTaskName && (
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active Now</Badge>
                        <span className="text-xs text-muted-foreground font-medium">Deadline: {dateFormatter(currentWork.nextDeadline)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-center gap-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-muted-foreground">Tasks Completed</span>
                        <span>{stats.tasksCompletedCount} / {stats.totalTasksAssigned}</span>
                      </div>
                      <Progress value={stats.totalTasksAssigned ? (stats.tasksCompletedCount / stats.totalTasksAssigned) * 100 : 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-muted-foreground">Points Earned</span>
                        <span>{stats.currentProjectPoints?.completed}</span>
                      </div>
                      <Progress value={stats.currentProjectPoints?.percentage || 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <VelocityChart 
                title="7-Day Velocity" 
                description="Points burned by this member over the last week" 
                data={mappedVelocityData} 
              />
            </div>
          </div>

          <div className="mt-6">
            <VerticalBarChart data={segmentChartData} />
          </div>
        </TabsContent>

        <TabsContent value="segments" className="mt-0 space-y-6">
          <div className="mb-6">
            <VerticalBarChart data={segmentChartData} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.length > 0 ? segments.map((segment: any) => (
              <Card key={segment.segmentId} className="shadow-sm border-border bg-card hover:border-primary/40 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                        <Layers className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground leading-none mb-1.5">{segment.segmentName}</h3>
                        <p className="text-sm text-muted-foreground font-medium">{segment.memberTasksCompleted} of {segment.memberTasksTotal} tasks done</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="uppercase text-[10px] tracking-wider font-semibold">{segment.segmentStatus}</Badge>
                  </div>
                  <div className="space-y-2.5 bg-muted/30 p-4 rounded-lg border border-border">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Points Contribution</span>
                      <span className="text-foreground">{segment.memberPointsEarned} / {segment.memberPointsAssigned}</span>
                    </div>
                    <Progress value={segment.memberPointsAssigned ? (segment.memberPointsEarned / segment.memberPointsAssigned) * 100 : 0} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-1 md:col-span-2 p-8 text-center text-muted-foreground border rounded-xl border-dashed">
                No segments assigned to this member.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-0">
          <Card className="shadow-sm border-border overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle>Task Assignment History</CardTitle>
              <CardDescription>Comprehensive list of all tasks. Reassigned tasks with partial credit are highlighted.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Task Name</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Segment</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Priority</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Status</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Points Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {tasks.length > 0 ? tasks.map((task: any) => {
                      const isPartialContribution = task.earnedPoints > 0 && task.earnedPoints < task.effortPoints;

                      return (
                        <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-semibold block text-foreground mb-0.5">{task.name}</span>
                            <span className="text-xs text-muted-foreground font-medium">{dateFormatter(task.startDate)} - {dateFormatter(task.endDate)}</span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">{task.segmentName}</td>
                          <td className="px-6 py-4"><Badge variant="outline" className="font-medium text-[10px] uppercase tracking-wider">{task.priority}</Badge></td>
                          <td className="px-6 py-4"><Badge variant="secondary" className="font-medium text-[10px] uppercase tracking-wider">{task.status}</Badge></td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isPartialContribution && (
                                <span title="Partial Contribution (Task reassigned)" className="text-amber-500">
                                  <AlertCircle className="size-4" />
                                </span>
                              )}
                              <span className={`font-bold px-2 py-1 rounded-md text-xs ${isPartialContribution ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                                {task.earnedPoints} / {task.effortPoints} pts
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr><td colSpan={5} className="py-12 text-center text-muted-foreground font-medium">No tasks found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}