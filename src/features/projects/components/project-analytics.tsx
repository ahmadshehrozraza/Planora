"use client";

import React, { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  PieChart, Pie, Cell, Label, Tooltip, ResponsiveContainer
} from "recharts";
import { 
  DollarSign, TrendingUp, AlertTriangle, 
  Calendar, AlertOctagon, Target, PieChartIcon, ArrowUpRight
} from "lucide-react";
import { format, differenceInDays, addDays, isAfter } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge"; 
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { getProjectAnalyticsData } from "../hooks/project-analytics-data";
import { TaskPriority, TaskStatus } from "@/features/tasks/types";
import { PageLoader } from "@/components/page-loader";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ProjectBurndownChart } from "@/features/dashboard/components/project-burndown-chart";
import { ProjectCumulativeFlow } from "@/features/dashboard/components/project-cumulative-flow";
import { ProjectVelocityChart } from "@/features/dashboard/components/project-velocity-chart";

interface ProjectAnalyticsProps {
  projectId: string;
}

const segmentChartConfig = {
  progress: {
    label: "Progress (%)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const statusChartConfig = {
  done: { label: "Done", color: "#10b981" },
  in_progress: { label: "In Progress", color: "#3b82f6" }, 
  in_review: { label: "In Review", color: "#a855f7" }, 
  todo: { label: "To Do", color: "#f59e0b" },
  backlog: { label: "Backlog", color: "#64748b" }, 
} satisfies ChartConfig;

const budgetConfig = {
  spent: { label: "Budget Spent ($)", color: "hsl(var(--primary))" },
} satisfies ChartConfig;


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

  const taskStatusData = useMemo(() => {
    if (!analytics) return [];
    const counts = { done: 0, in_progress: 0, in_review: 0, todo: 0, backlog: 0 };
    
    analytics.tasks.forEach(task => {
      if (task.taskStatus === TaskStatus.DONE) counts.done++;
      else if (task.taskStatus === TaskStatus.IN_PROGRESS) counts.in_progress++;
      else if (task.taskStatus === TaskStatus.IN_REVIEW) counts.in_review++;
      else if (task.taskStatus === TaskStatus.TODO) counts.todo++;
      else counts.backlog++;
    });

    return [
      { status: "Done", count: counts.done, fill: "var(--color-done)" },
      { status: "In Progress", count: counts.in_progress, fill: "var(--color-in_progress)" },
      { status: "In Review", count: counts.in_review, fill: "var(--color-in_review)" },
      { status: "To Do", count: counts.todo, fill: "var(--color-todo)" },
      { status: "Backlog", count: counts.backlog, fill: "var(--color-backlog)" },
    ].filter(item => item.count > 0); 
  }, [analytics]);

  const segmentBudgetData = useMemo(() => {
    if (!analytics) return [];
    return analytics.segments.map(seg => {
      const spent = Math.floor(Math.random() * 5000) + 1000; 
      return {
        name: seg.name,
        spent: spent
      };
    }).sort((a, b) => b.spent - a.spent); 
  }, [analytics]);

  const topExpensiveTasks = useMemo(() => {
    if (!analytics) return [];
    return [...analytics.tasks]
      .sort((a, b) => (b.budget || 0) - (a.budget || 0))
      .slice(0, 5);
  }, [analytics]);


  if (!analytics || !predictions) return <div className="p-8"><PageLoader /></div>;

  const { meta, segments, members, kpi } = analytics;

  return (
    <div className="w-full p-3 space-y-8 bg-background">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">{meta.name}</h1>
          <div className="flex items-center gap-3 mt-3 text-muted-foreground">
              <Badge variant="outline" className="text-sm px-3 py-1 font-medium">
                  {meta.projectStatus.replace(/_/g, " ")}
              </Badge>
              <span>•</span>
              <span className="flex items-center gap-2 font-medium">
                  <Calendar className="size-4" />
                  {format(meta.startDate, "MMM d, yyyy")} - {format(meta.dueDate, "MMM d, yyyy")}
              </span>
          </div>
          <p className="text-muted-foreground mt-2 max-w-3xl leading-relaxed">{meta.description}</p>
        </div>
        
        <div className="text-right bg-muted/50 p-5 rounded-xl border border-border min-w-[200px] shadow-sm">
          <p className="text-sm font-semibold text-muted-foreground mb-1">Overall Completion</p>
          <div className="flex items-center gap-3 justify-end">
            <span className="text-4xl font-bold text-foreground">{meta.progress}%</span>
          </div>
          <Progress value={meta.progress} className="w-full h-2 mt-3 transition-all duration-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`border-l-4 ${predictions.isDelayed ? 'border-l-rose-500 bg-rose-500/5' : 'border-l-emerald-500 bg-emerald-500/5'} shadow-sm`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Calendar className="size-4" /> Timeline Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1">
              <h3 className={`text-2xl font-bold ${predictions.isDelayed ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {predictions.isDelayed ? `${predictions.delayDays} Days Delayed` : "On Track"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                Expected: {format(predictions.projectedDate, "MMM d, yyyy")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${predictions.projectedBudgetVariance < 0 ? 'border-l-rose-500 bg-rose-500/5' : 'border-l-blue-500 bg-blue-500/5'} shadow-sm`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <DollarSign className="size-4" /> Budget Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1">
              <h3 className={`text-2xl font-bold ${predictions.projectedBudgetVariance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {predictions.projectedBudgetVariance >= 0 
                  ? `$${predictions.projectedBudgetVariance.toLocaleString()} Surplus` 
                  : `-$${Math.abs(predictions.projectedBudgetVariance).toLocaleString()} Deficit`}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                Est. Final Cost: ${predictions.projectedTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} / ${meta.budget.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-purple-500/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <TrendingUp className="size-4" /> Performance Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1">
              <h3 className="text-2xl font-bold text-foreground">
                {predictions.velocity.toFixed(1)} <span className="text-sm font-semibold text-muted-foreground">tasks / day</span>
              </h3>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                {predictions.tasksRemaining} Tasks Remaining
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="size-5 text-primary" /> Budget Utilization by Segment
            </CardTitle>
            <CardDescription>Where has the project budget been spent so far?</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={budgetConfig} className="w-full h-[250px]">
              <BarChart accessibilityLayer data={segmentBudgetData} margin={{ top: 10, left: -20, right: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <ChartTooltip cursor={{ fill: "var(--theme-muted)", opacity: 0.2 }} content={<ChartTooltipContent />} />
                <Bar dataKey="spent" fill="var(--color-spent)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-border bg-card">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <DollarSign className="size-5" /> Costliest Tasks
            </CardTitle>
            <CardDescription>Tasks taking up the most budget.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 p-0">
             <div className="flex flex-col divide-y divide-border">
                {topExpensiveTasks.length > 0 ? (
                  topExpensiveTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col gap-1 min-w-0 pr-4">
                        <span className="text-sm font-semibold text-foreground truncate">{task.name}</span>
                        <span className="text-xs text-muted-foreground truncate">Assigned: {task.assigneeId || 'Unassigned'}</span>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-sm font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                          ${(task.budget || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">No budget assigned to tasks yet.</div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <ProjectBurndownChart />
        <ProjectCumulativeFlow />
        <ProjectVelocityChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <Card className="shadow-sm border-border col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="size-5 text-primary" /> Task Breakdown</CardTitle>
            <CardDescription>Current status of all {kpi.totalTasks} tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={statusChartConfig} className="mx-auto aspect-square max-h-[250px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={taskStatusData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  strokeWidth={2}
                  stroke="var(--background)"
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                              {kpi.totalTasks}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-xs">
                              Total Tasks
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

        <Card className="shadow-sm border-border col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Segment Progress</CardTitle>
            <CardDescription>Visualizing completion per phase</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={segmentChartConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={segments} layout="vertical" margin={{ left: -10, right: 10 }}>
                <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                />
                <ChartTooltip cursor={{ fill: "var(--theme-muted)", opacity: 0.2 }} content={<ChartTooltipContent indicator="line" />} />
                
                <Bar dataKey="progress" fill="var(--color-progress)" radius={[0, 4, 4, 0]} barSize={24}>
                  {segments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.progress < 50 && entry.segmentStatus === 'ACTIVE' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="shadow-sm border-border overflow-hidden col-span-1 lg:col-span-2">
          <CardHeader className="bg-muted/30 border-b border-border">
            <CardTitle>Team Performance Matrix</CardTitle>
            <CardDescription>Contribution vs Efficiency analysis</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Member</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Role</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground whitespace-nowrap">Tasks Done</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground whitespace-nowrap">Efficiency</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground whitespace-nowrap">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {members.map((m) => (
                    <tr key={m.memberId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <MemberAvatar name={m.memberId} className="size-8 shadow-sm" />
                          <span className="font-semibold text-foreground">{m.memberId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="font-medium print:bg-transparent">
                          {m.role}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="font-bold text-foreground">{m.projectTasksCompleted}</span>
                        <span className="text-muted-foreground font-medium text-xs mx-1">/</span>
                        <span className="text-muted-foreground font-medium text-xs">{m.projectTasks}</span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-foreground px-2 py-1 rounded border border-border/50 print:border-solid print:border-gray-300">
                          {m.efficiency}%
                        </span>
                      </td>
                      
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-primary px-2 py-1 bg-primary/10 rounded print:bg-transparent print:text-black">
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

        <Card className="border-border bg-card shadow-sm col-span-1">
          <CardHeader className="bg-rose-500/5 border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertOctagon className="size-5" /> Critical Attention
            </CardTitle>
            <CardDescription className="text-muted-foreground">High priority tasks that are stalled.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <div className="space-y-0 divide-y divide-border">
              {criticalStuckTasks.length > 0 ? (
                criticalStuckTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-background hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5">
                        <AlertTriangle className="size-4 text-rose-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{task.name}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate">Assigned: {task.assigneeId || 'Unassigned'}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold text-[10px] uppercase tracking-wider">
                          {task.taskStatus.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-emerald-500/10 rounded-full mb-3">
                    <TrendingUp className="size-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">All high priority tasks are on track.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default React.memo(ProjectAnalytics);