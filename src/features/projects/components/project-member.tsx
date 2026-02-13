"use client";

import React, { useState } from 'react';
import { format } from "date-fns";
import {
  Zap,
  Calendar,
  Target,
  TrendingUp,
  Briefcase,
  Mail,
  Layers,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Clock
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Badge } from "@/components/ui/badge";
import { MemberRole } from "@/features/members/types";
import { PageLoader } from "@/components/page-loader";

// --- Helper Functions ---

const formatDate = (date: string | Date | undefined | null, pattern: string) => {
  if (!date) return "N/A";
  try {
    return format(new Date(date), pattern);
  } catch (error) {
    return "N/A";
  }
};

const StatCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <Card className="hover:shadow-md transition-shadow duration-200 border-slate-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="p-2 bg-slate-50 rounded-lg">
          <Icon className="h-4 w-4 text-slate-500" />
        </div>
      </div>
      <div className="flex items-end gap-2 mt-2">
        <div className="text-3xl font-bold text-slate-900">{value ?? 0}</div>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mb-1">
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>
    </CardContent>
  </Card>
);

export default function ProjectMember({ memberInfo }: { memberInfo: any }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Guard Clause: Show Loader if data is missing
  if (!memberInfo) return <PageLoader />;

  // --- DATA MAPPING ---
  const meta = memberInfo.meta || {};
  const stats = memberInfo.stats || {};
  const currentWork = memberInfo.currentWork || {};
  const segments = memberInfo.segments || [];

  // Calculate Tasks list specifically for the History Table (Flattening segments)
  const allTasks = segments.flatMap((segment: any) =>
    segment.tasks.map((task: any) => ({
      ...task,
      segmentName: segment.segmentName
    }))
  );

  // Role State
  const [role, setRole] = useState<string>(meta.role || "MEMBER");

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    console.log(`Role updated to: ${newRole}`);
  };

  const handleRemoveMember = () => {
    console.log("Removing member...");
  };

  return (
    <div className="w-full space-y-8 p-6 bg-slate-50/50 min-h-screen">

      {/* --- 1. Main Header --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">

          <div className="flex items-center gap-6 w-full md:w-auto">
            <MemberAvatar
              name={meta.userId || "Unknown"}
              className="size-24 text-3xl border-[6px] border-slate-50 shadow-md"
              fallbackClassname="bg-gradient-to-br from-indigo-100 to-violet-200 text-indigo-700"
              isActive={meta.status === "Active"}
            />

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{meta.userId}</h1>
                <Badge variant={role as MemberRole} />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <Briefcase className="size-4 text-slate-400" />
                  <span>{meta.projectId}</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-slate-400" />
                  <span>{meta.userId}@example.com</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-slate-400" />
                  <span>Joined {formatDate(meta.joinedDate, 'MMM yyyy')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            {/* <div className="hidden lg:flex flex-col items-end mr-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Current Load</span>
                <div className="flex items-center gap-2">
                   <span className={`size-2.5 rounded-full ${meta.status === "Active" ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} />
                   <span className="font-semibold text-slate-700">{currentWork.workloadLabel || "Unknown"}</span>
                </div>
             </div> */}

            <Separator orientation="vertical" className="hidden lg:block h-10 mx-2" />

            <div className="w-full sm:w-[160px]">
              <Select value={role} onValueChange={handleRoleChange}>
                <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MemberRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={MemberRole.PROJECT_MANAGER}>Project Manager</SelectItem>
                  <SelectItem value={MemberRole.MEMBER}>Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="destructive">
              <Trash2 className="size-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </div>

      {/* --- 2. Effort Metrics --- */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Assigned Points" 
          value={stats.currentProjectPoints?.totalAssigned || 0}
          subtext="Total points assigned"
          icon={Target}
        />
        <StatCard 
          title="Points Earned" 
          value={stats.currentProjectPoints?.completed || 0}
          subtext="Total points completed"
          icon={Zap}
          trend={`${stats.currentProjectPoints?.percentage || 0}%`}
        />
        <StatCard 
          title="Lifetime Contribution" 
          value={stats.totalEffortPointsEarned || 0}
          subtext="All time effort points"
          icon={Target}
        />
        <StatCard 
          title="Efficiency Score" 
          value={`${stats.efficiencyScore || 0}%`}
          subtext={`Avg completion: ${stats.avgCompletionTimeDays || 0} days`}
          icon={TrendingUp}
        />
      </div> */}

      {/* --- 3. Tabs --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto rounded-xl shadow-sm">
            <TabsTrigger value="overview" className="h-9 px-4 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">Overview</TabsTrigger>
            <TabsTrigger value="segments" className="h-9 px-4 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">Segments</TabsTrigger>
            <TabsTrigger value="tasks" className="h-9 px-4 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">History</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <Card className="lg:col-span-2 border-l-4 border-l-indigo-500 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <Clock className="size-5 text-indigo-500" />
                  Active Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold text-slate-900">{currentWork.activeTaskName || "No active task"}</h3>
                  <p className="text-slate-500 font-medium">{currentWork.activeSegmentName}</p>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                    <Badge variant="ACTIVE" />
                    <span className="text-sm text-slate-500 font-medium">
                      Deadline: <span className="text-slate-900">{formatDate(currentWork.nextDeadline, 'MMM dd, yyyy')}</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-slate-700">Completion Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-500">Tasks Completed</span>
                    <span className="text-slate-900">{stats.tasksCompletedCount} / {stats.totalTasksAssigned}</span>
                  </div>
                  <Progress value={stats.totalTasksAssigned ? (stats.tasksCompletedCount / stats.totalTasksAssigned) * 100 : 0} className="h-2 bg-slate-100" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-500">Earned Points</span>
                    <span className="text-slate-900">{stats.currentProjectPoints?.completed}</span>
                  </div>
                  <Progress value={stats.currentProjectPoints?.percentage || 0} className="h-2 bg-slate-100" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Segments */}
        <TabsContent value="segments" className="space-y-4">
          {segments.map((segment: any) => (
            <Card key={segment.segmentId} className="hover:border-indigo-200 hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Layers className="size-6 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{segment.segmentName}</h3>
                      <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">
                        {segment.memberTasksCompleted} of {segment.memberTasksTotal} tasks done
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start">
                    <Badge variant={segment.segmentStatus} />
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                  <div className="flex justify-between text-sm font-semibold text-slate-700">
                    <span>Points Contribution</span>
                    <span>{segment.memberPointsEarned} / {segment.memberPointsAssigned}</span>
                  </div>
                  <Progress
                    value={segment.memberPointsAssigned ? (segment.memberPointsEarned / segment.memberPointsAssigned) * 100 : 0}
                    className="h-2.5"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab: Tasks History */}
        <TabsContent value="tasks">
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-800">Task History</CardTitle>
              <CardDescription>Comprehensive list of all assigned tasks</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="h-12 px-6 align-middle">Task Name</th>
                      <th className="h-12 px-6 align-middle">Segment</th>
                      <th className="h-12 px-6 align-middle">Priority</th>
                      <th className="h-12 px-6 align-middle">Status</th>
                      <th className="h-12 px-6 align-middle text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {allTasks.length > 0 ? (
                      allTasks.map((task: any) => (
                        <tr key={task.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="p-6 align-middle">
                            <span className="font-semibold text-slate-900 block mb-0.5">{task.name}</span>
                            <span className="text-xs text-slate-400 font-medium">
                              {formatDate(task.startDate, 'MMM d')} - {formatDate(task.endDate, 'MMM d')}
                            </span>
                          </td>
                          <td className="p-6 align-middle text-slate-600 font-medium">
                            {task.segmentName}
                          </td>
                          <td className="p-6 align-middle">
                            <Badge variant={task.priority} />
                          </td>
                          <td className="p-6 align-middle">
                            <Badge variant={task.status} />
                          </td>
                          <td className="p-6 align-middle text-right font-bold text-slate-700">
                            {task.earnedPoints} / {task.effortPoints}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
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