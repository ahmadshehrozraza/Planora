"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Briefcase,
  Mail,
  Layers,
  Trash2,
  Clock,
  ArrowLeft,
  Shield,
  Activity,
  Target
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  PieChart, Pie, Label, Cell 
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
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
import { Badge } from "@/components/ui/badge";
import { MemberRole } from "@/features/members/types";
import { PageLoader } from "@/components/page-loader";
import { dateFormatter } from '@/components/date-indicator';

const velocityConfig = {
  points: { label: "Points Burned", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const contributionConfig = {
  member: { label: "This Member", color: "hsl(var(--primary))" },
  others: { label: "Rest of Team", color: "hsl(var(--muted))" },
} satisfies ChartConfig;


export default function ProjectMember({ memberInfo }: { memberInfo: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  if (!memberInfo) return <PageLoader />;

  const meta = memberInfo.meta || {};
  const stats = memberInfo.stats || {};
  const currentWork = memberInfo.currentWork || {};
  const segments = memberInfo.segments || [];

  const allTasks = segments.flatMap((segment: any) =>
    segment.tasks.map((task: any) => ({
      ...task,
      segmentName: segment.segmentName
    }))
  );

  const [role, setRole] = useState<string>(meta.role || "MEMBER");

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
  };

  const handleRemoveMember = () => {
    console.log("Removing member...");
  };

  const dummyVelocityData = [
    { day: "Mon", points: 5 },
    { day: "Tue", points: 12 },
    { day: "Wed", points: 8 },
    { day: "Thu", points: 15 },
    { day: "Fri", points: 10 },
    { day: "Sat", points: 0 },
    { day: "Sun", points: 0 },
  ];

  const memberPoints = stats.currentProjectPoints?.completed || 120;
  const projectTotalPoints = 500; 
  const contributionData = [
    { name: "This Member", value: memberPoints, fill: "var(--color-member)" },
    { name: "Rest of Team", value: projectTotalPoints - memberPoints, fill: "var(--color-others)" },
  ];
  const contributionPercent = Math.round((memberPoints / projectTotalPoints) * 100);

  return (
    <div className="w-full flex flex-col space-y-6 pb-8 text-foreground">

      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="pl-0 hover:bg-transparent hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to Project Members
        </Button>
      </div>

      <Card className="border-border shadow-sm bg-card">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <MemberAvatar
            name={meta.userId || "Unknown"}
            className="size-20 sm:size-24 text-3xl border shadow-sm"
            isActive={meta.status === "Active"}
          />
          
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{meta.userId}</h1>
              <Badge variant="secondary" className="uppercase tracking-wider text-xs">
                {role.replace(/_/g, " ")}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground font-medium mb-4 sm:mb-0">
              <span className="flex items-center gap-1.5">
                <Briefcase className="size-4" /> {meta.projectId}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="size-4" /> {meta.userId}@example.com
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" /> Joined {dateFormatter(meta.joinedDate)}
              </span>
            </div>
          </div>

          <div className="w-full sm:w-auto flex justify-center sm:justify-end shrink-0 mt-2 sm:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shadow-sm">
                  <Shield className="size-4 mr-2" />
                  Manage Access
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Project Role
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={role} onValueChange={handleRoleChange}>
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
                  onClick={handleRemoveMember}
                  className="text-destructive font-medium focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <Trash2 className="size-4 mr-2" />
                  Remove from Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-muted/50 border border-border h-10">
          <TabsTrigger value="overview" className="h-8 px-4 rounded-md">Overview</TabsTrigger>
          <TabsTrigger value="segments" className="h-8 px-4 rounded-md">Segments</TabsTrigger>
          <TabsTrigger value="tasks" className="h-8 px-4 rounded-md">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 shadow-sm border-border bg-card flex flex-col">
              <CardHeader className="pb-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="size-4 text-primary" /> Overall Contribution
                </CardTitle>
                <CardDescription>Value added to the total project effort.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4 flex items-center justify-center">
                <ChartContainer config={contributionConfig} className="w-full aspect-square max-h-[180px]">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={contributionData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      strokeWidth={3}
                      stroke="var(--background)"
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                  {contributionPercent}%
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

            <Card className="col-span-1 lg:col-span-2 shadow-sm border-border bg-card flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="size-4 text-primary" /> 7-Day Velocity
                </CardTitle>
                <CardDescription>Points burned by this member over the last week.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 mt-2">
                <ChartContainer config={velocityConfig} className="w-full h-[160px]">
                  <BarChart accessibilityLayer data={dummyVelocityData} margin={{ top: 0, left: -20, right: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <ChartTooltip cursor={{ fill: "var(--theme-muted)", opacity: 0.2 }} content={<ChartTooltipContent />} />
                    <Bar dataKey="points" fill="var(--color-points)" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-sm border-border bg-card">
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Clock className="size-5 text-primary" />
                  Active Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold text-foreground">{currentWork.activeTaskName || "No active task"}</h3>
                  <p className="text-muted-foreground font-medium">{currentWork.activeSegmentName}</p>

                  <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                      Active
                    </Badge>
                    <span className="text-sm text-muted-foreground font-medium">
                      Deadline: <span className="text-foreground">{dateFormatter(currentWork.nextDeadline)}</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <CardTitle className="text-base font-semibold">Overall Stats</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Tasks Completed</span>
                    <span>{stats.tasksCompletedCount} / {stats.totalTasksAssigned}</span>
                  </div>
                  <Progress value={stats.totalTasksAssigned ? (stats.tasksCompletedCount / stats.totalTasksAssigned) * 100 : 0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Earned Points</span>
                    <span>{stats.currentProjectPoints?.completed}</span>
                  </div>
                  <Progress value={stats.currentProjectPoints?.percentage || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="mt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.map((segment: any) => (
              <Card key={segment.segmentId} className="shadow-sm border-border bg-card hover:border-primary/40 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                        <Layers className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground leading-none mb-1.5">{segment.segmentName}</h3>
                        <p className="text-sm text-muted-foreground font-medium">
                          {segment.memberTasksCompleted} of {segment.memberTasksTotal} tasks done
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="uppercase text-[10px] tracking-wider font-semibold">
                      {segment.segmentStatus}
                    </Badge>
                  </div>

                  <div className="space-y-2.5 bg-muted/30 p-4 rounded-lg border border-border">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Points Contribution</span>
                      <span className="text-foreground">{segment.memberPointsEarned} / {segment.memberPointsAssigned}</span>
                    </div>
                    <Progress
                      value={segment.memberPointsAssigned ? (segment.memberPointsEarned / segment.memberPointsAssigned) * 100 : 0}
                      className="h-1.5"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-0">
          <Card className="shadow-sm border-border overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle>Task History</CardTitle>
              <CardDescription>Comprehensive list of all assigned tasks in this project</CardDescription>
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
                      <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {allTasks.length > 0 ? (
                      allTasks.map((task: any) => (
                        <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-semibold block text-foreground mb-0.5">{task.name}</span>
                            <span className="text-xs text-muted-foreground font-medium">
                              {dateFormatter(task.startDate)} - {dateFormatter(task.endDate)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">
                            {task.segmentName}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="font-medium text-[10px] uppercase tracking-wider">{task.priority}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="font-medium text-[10px] uppercase tracking-wider">{task.status}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-md text-xs">
                              {task.earnedPoints} / {task.effortPoints} pts
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted-foreground font-medium">
                          No tasks found.
                        </td>
                      </tr>
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