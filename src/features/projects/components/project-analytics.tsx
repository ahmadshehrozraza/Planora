"use client";

import React, { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  Cell 
} from "recharts";
import { 
  DollarSign, TrendingUp, AlertTriangle, 
  Calendar, AlertOctagon 
} from "lucide-react";
import { format, differenceInDays, addDays, isAfter } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge"; 
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { getProjectAnalyticsData } from "../hooks/project-analytics-data";
import { TaskPriority, TaskStatus } from "@/features/tasks/types";
import { PageLoader } from "@/components/page-loader";

interface ProjectAnalyticsProps {
  projectId: string;
}

const ProjectAnalytics = ({ projectId }: ProjectAnalyticsProps) => {
  const analytics = getProjectAnalyticsData(projectId);

  const predictions = useMemo(() => {
    if (!analytics) return null;

    const { meta, kpi } = analytics;
    const today = new Date();
    
    const daysElapsed = differenceInDays(today, meta.startDate);
    const velocity = daysElapsed > 0 ? (kpi.completedTasks / daysElapsed) : 0; 
    const tasksRemaining = kpi.totalTasks - kpi.completedTasks;
    const daysNeededToComplete = velocity > 0 ? Math.ceil(tasksRemaining / velocity) : 0;
    const projectedDate = addDays(today, daysNeededToComplete);
    
    const isDelayed = isAfter(projectedDate, meta.dueDate);
    const delayDays = differenceInDays(projectedDate, meta.dueDate);
    
    const avgCostPerTask = kpi.budgetUsed / (kpi.completedTasks || 1);
    const projectedTotalCost = kpi.budgetUsed + (tasksRemaining * avgCostPerTask);
    const projectedBudgetVariance = meta.budget - projectedTotalCost;

    return {
      velocity,
      tasksRemaining,
      projectedDate,
      isDelayed,
      delayDays,
      projectedTotalCost,
      projectedBudgetVariance
    };
  }, [analytics]);

  const criticalStuckTasks = useMemo(() => {
    if (!analytics) return [];
    return analytics.tasks.filter(t => 
      (t.taskPriority === TaskPriority.HIGH) &&
      (t.taskStatus === TaskStatus.BACKLOG || t.taskStatus === TaskStatus.IN_PROGRESS)
    );
  }, [analytics]);

  if (!analytics || !predictions) return <div className="p-8"><PageLoader /></div>;

  const { meta, segments, members } = analytics;

  return (
    <div className="w-full p-8 space-y-8 bg-white">
        
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{meta.name}</h1>
          <div className="flex items-center gap-3 mt-3 text-slate-500">
              <Badge variant="outline" className="text-sm px-3 py-1 bg-slate-50 font-medium">
                  {meta.projectStatus.replace(/_/g, " ")}
              </Badge>
              <span>•</span>
              <span className="flex items-center gap-2 font-medium">
                  <Calendar className="size-4" />
                  {format(meta.startDate, "MMM d, yyyy")} - {format(meta.dueDate, "MMM d, yyyy")}
              </span>
          </div>
          <p className="text-slate-500 mt-2 max-w-3xl leading-relaxed">{meta.description}</p>
        </div>
        
        <div className="text-right bg-slate-50 p-5 rounded-xl border border-slate-100 min-w-[200px] shadow-sm">
          <p className="text-sm font-semibold text-slate-500 mb-1">Overall Completion</p>
          <div className="flex items-center gap-3 justify-end">
            <span className="text-4xl font-bold text-slate-900">{meta.progress}%</span>
          </div>
          <Progress value={meta.progress} className="w-full h-2 mt-3 transition-all duration-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`border-l-4 ${predictions.isDelayed ? 'border-l-red-500 bg-red-50/10' : 'border-l-emerald-500 bg-emerald-50/10'} shadow-sm border-t border-r border-b border-slate-100`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <Calendar className="size-4" /> Timeline Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1">
              <h3 className={`text-2xl font-bold ${predictions.isDelayed ? 'text-red-600' : 'text-emerald-600'}`}>
                {predictions.isDelayed ? `${predictions.delayDays} Days Delayed` : "On Track"}
              </h3>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                Expected: {format(predictions.projectedDate, "MMM d, yyyy")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${predictions.projectedBudgetVariance < 0 ? 'border-l-red-500 bg-red-50/10' : 'border-l-blue-500 bg-blue-50/10'} shadow-sm border-t border-r border-b border-slate-100`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <DollarSign className="size-4" /> Budget Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1">
              <h3 className={`text-2xl font-bold ${predictions.projectedBudgetVariance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {predictions.projectedBudgetVariance >= 0 
                  ? `$${predictions.projectedBudgetVariance.toLocaleString()} Surplus` 
                  : `-$${Math.abs(predictions.projectedBudgetVariance).toLocaleString()} Deficit`}
              </h3>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                Est. Final Cost: ${predictions.projectedTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-purple-50/10 shadow-sm border-t border-r border-b border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <TrendingUp className="size-4" /> Performance Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1">
              <h3 className="text-2xl font-bold text-slate-900">
                {predictions.velocity.toFixed(1)} <span className="text-sm font-semibold text-slate-500">tasks / day</span>
              </h3>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                {predictions.tasksRemaining} Tasks Remaining
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Segment Progress</CardTitle>
            <CardDescription>Visualizing completion per phase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segments} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} />
                  <Bar dataKey="progress" name="Progress %" barSize={28} radius={[0, 4, 4, 0]}>
                    {segments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.progress < 50 && entry.segmentStatus === 'ACTIVE' ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100 bg-white shadow-sm">
          <CardHeader className="bg-red-50/50 border-b border-red-50 pb-4">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertOctagon className="size-5" /> Critical Attention Needed
            </CardTitle>
            <CardDescription className="text-red-900/60">High priority tasks that are stalled.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {criticalStuckTasks.length > 0 ? (
                criticalStuckTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 shadow-sm hover:border-red-200 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <AlertTriangle className="size-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{task.name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Assigned: {task.assigneeId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-bold text-[10px] uppercase tracking-wider">
                          {task.taskStatus.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-emerald-50 rounded-full mb-3">
                    <TrendingUp className="size-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">All high priority tasks are on track.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle>Team Performance Matrix</CardTitle>
          <CardDescription>Contribution vs Efficiency analysis</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600">Member</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Role</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-600">Tasks Done</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-600">Efficiency</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-600">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.memberId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <MemberAvatar name={m.memberId} className="size-8 shadow-sm" />
                        <span className="font-semibold text-slate-900">{m.memberId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">
                        {m.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-900">{m.projectTasksCompleted}</span>
                      <span className="text-slate-400 font-medium text-xs ml-1">/ {m.projectTasks}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-700">{m.efficiency}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {m.projectPoints} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(ProjectAnalytics);