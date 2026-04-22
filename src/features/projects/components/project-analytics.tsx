"use client";

import React, { useMemo } from "react";
import { 
  PieChart, Pie, Label, Tooltip
} from "recharts";
import { 
  Banknote, TrendingUp, AlertTriangle, 
  Calendar, AlertOctagon, Target, Layers, Sparkles
} from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge"; 
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { PageLoader } from "@/components/page-loader";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BurndownChart } from "@/components/burndown-chart";
import { CumulativeFlow } from "@/components/cumulative-flow";
import { VelocityChart } from "@/components/velocity-chart";
import { VerticalBarChart } from "@/features/dashboard/components/vertical-bar-chart";
import { useGetProjectAnalytics } from "@/features/projects/api/use-get-project-analytics";
import { useProjectEstimations } from "../hooks/use-project-estimations";
import { ProjectAvatar } from "./project-avatar";

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#64748b", "#a855f7", "#ef4444"];

export default function ProjectAnalytics({ projectId }: { projectId: string }) {
  const { data: analytics, isLoading } = useGetProjectAnalytics({ projectId });
  const predictions = useProjectEstimations(analytics);

  const criticalStuckTasks = useMemo(() => {
    if (!analytics?.tasks) return [];
    return analytics.tasks.filter((t: any) => 
      t.priority?.toLowerCase() === "high" && t.progress < 100
    );
  }, [analytics]);

  const taskStatusData = useMemo(() => {
    if (!analytics?.tasks) return [];
    const statusMap = new Map<string, number>();
    analytics.tasks.forEach((task: any) => {
      const colName = task.column?.name || "Unmapped";
      statusMap.set(colName, (statusMap.get(colName) || 0) + 1);
    });
    return Array.from(statusMap.entries()).map(([status, count], index) => ({
      status, count, fill: PIE_COLORS[index % PIE_COLORS.length]
    }));
  }, [analytics]);

  const dynamicStatusConfig = useMemo(() => {
    const config: Record<string, any> = {};
    taskStatusData.forEach((item) => {
      config[item.status.toLowerCase().replace(/\s+/g, '_')] = { label: item.status, color: item.fill };
    });
    return config as ChartConfig;
  }, [taskStatusData]);

  const topExpensiveTasks = useMemo(() => {
    if (!analytics?.tasks) return [];
    return [...analytics.tasks].sort((a: any, b: any) => (b.budget || 0) - (a.budget || 0)).slice(0, 5);
  }, [analytics]);

  const cfdConfig = useMemo(() => {
    if (!analytics?.charts?.columns) return {};
    const config: Record<string, any> = {};
    analytics.charts.columns.forEach((col: string, index: number) => {
      config[col] = { label: col, color: PIE_COLORS[index % PIE_COLORS.length] };
    });
    return config as ChartConfig;
  }, [analytics]);

  if (isLoading || !analytics || !predictions) return <div className="h-[60vh] flex items-center justify-center"><PageLoader /></div>;

  const { meta, segments, members, kpi, charts } = analytics;
  const currency = meta.currency || "$";

  return (
    <div className="w-full p-3 space-y-8 bg-background print:bg-white print:p-0">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-8 print:border-black">
        <div>
          <div className="flex items-center gap-3">
            <ProjectAvatar 
              name={meta.name} 
              className="size-12" 
              image={meta.ImageUrl}
            />
            <h1 className="text-2xl font-bold text-foreground print:text-black">{meta.name}</h1>
          </div>
          
          <div className="flex items-center gap-3 mt-3 text-muted-foreground print:text-gray-800">
              <Badge variant="outline" className="text-sm px-3 py-1 font-medium print:text-black print:border-black">{meta.projectStatus.replace(/_/g, " ")}</Badge>
              <span>•</span>
              <span className="flex items-center gap-2 font-medium">
                  <Calendar className="size-4" />
                  {meta.startDate ? format(new Date(meta.startDate), "MMM d, yyyy") : "N/A"} - {meta.dueDate ? format(new Date(meta.dueDate), "MMM d, yyyy") : "N/A"}
              </span>
          </div>
          <p className="text-muted-foreground mt-2 max-w-3xl leading-relaxed print:text-black">{meta.description}</p>
        </div>
        
        <div className="text-right bg-muted/50 p-5 rounded-xl border border-border min-w-[200px] shadow-sm print:bg-transparent print:border-black">
          <p className="text-sm font-semibold text-muted-foreground mb-1 print:text-black">Overall Completion</p>
          <div className="flex items-center gap-3 justify-end">
            <span className="text-4xl font-bold text-foreground print:text-black">{meta.progress}%</span>
          </div>
          <Progress value={meta.progress} className="w-full h-2 mt-3 transition-all duration-500 print:border print:border-black" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Card className={`border-l-4 ${predictions.isDelayed ? 'border-l-rose-500 bg-rose-500/5' : 'border-l-emerald-500 bg-emerald-500/5'} shadow-sm print:break-inside-avoid print:border-black print:bg-transparent relative overflow-hidden`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2 print:text-black">
              <Calendar className="size-4" /> Timeline Forecast
            </CardTitle>
            {predictions.isAiPowered && (
              <Badge variant="outline" className="absolute top-4 right-4 bg-primary/10 text-primary border-primary/20 text-[9px] uppercase  ">
                <span className="flex justify-center gap-1.5">
                  <Sparkles className="size-3 shrink-0" /> 
                  AI Predicted • {predictions.aiConfidence}% Sure
                  </span>
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="mt-1">
              <h3 className={`text-2xl font-bold ${predictions.isDelayed ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'} print:text-black`}>
                {predictions.isDelayed ? `${predictions.delayDays} Days Delayed` : "On Track"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 font-medium print:text-black">Expected: {format(predictions.projectedDate, "MMM d, yyyy")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${predictions.budgetRisk === 'CRITICAL' ? 'border-l-rose-500 bg-rose-500/5' : predictions.budgetRisk === 'WARNING' ? 'border-l-amber-500 bg-amber-500/5' : 'border-l-blue-500 bg-blue-500/5'} shadow-sm print:break-inside-avoid print:border-black print:bg-transparent relative overflow-hidden`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2 print:text-black">
              <Banknote className="size-4" /> Budget Health
            </CardTitle>
            {predictions.isAiPowered && (
               <Badge variant="outline" className={`absolute top-4 right-4 text-[9px] uppercase font-bold ${predictions.budgetRisk === 'CRITICAL' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : predictions.budgetRisk === 'WARNING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                 Risk: {predictions.budgetRisk}
               </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="mt-1">
              <h3 className={`text-2xl font-bold ${predictions.projectedBudgetVariance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'} print:text-black`}>
                {predictions.projectedBudgetVariance >= 0 ? `${currency}${predictions.projectedBudgetVariance.toLocaleString()} Surplus` : `-${currency}${Math.abs(predictions.projectedBudgetVariance).toLocaleString()} Deficit`}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 font-medium print:text-black">
                Est. Final: {currency}{predictions.projectedTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {currency}{(meta.budget || 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-purple-500/5 shadow-sm print:break-inside-avoid print:border-black print:bg-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2 print:text-black">
              <TrendingUp className="size-4" /> Performance Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1">
              <h3 className="text-2xl font-bold text-foreground print:text-black">
                {predictions.velocity.toFixed(1)} <span className="text-sm font-semibold text-muted-foreground print:text-black">points / day</span>
              </h3>
              <p className="text-sm text-muted-foreground mt-1 font-medium print:text-black">
                {predictions.pointsRemaining} Effort Points Remaining
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="print:break-inside-avoid">
          <BurndownChart data={charts.burndown} />
        </div>
        <div className="print:break-inside-avoid">
          <VelocityChart data={charts.velocity} />
        </div>
        <div className="lg:col-span-2 print:break-inside-avoid">
          <CumulativeFlow data={charts.cfd} config={cfdConfig} />
        </div>
        <div className="lg:col-span-2 print:break-inside-avoid">
          <VerticalBarChart data={segments} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <Card className="shadow-sm border-border col-span-1 print:break-inside-avoid">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 print:text-black"><Target className="size-5 text-primary print:text-black" /> Task Breakdown</CardTitle>
            <CardDescription className="print:text-black">Current status across all {kpi.totalTasks} tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={dynamicStatusConfig} className="mx-auto aspect-square max-h-[250px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={taskStatusData} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={2} stroke="var(--background)">
                  <Label content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold print:fill-black">{kpi.totalTasks}</tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-xs print:fill-black">Total Tasks</tspan>
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

        <Card className="shadow-sm border-border col-span-1 lg:col-span-2 print:break-inside-avoid">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 print:text-black"><Banknote className="size-5 print:text-black" /> Costliest Tasks</CardTitle>
            <CardDescription className="print:text-black">Tasks taking up the most budget.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 p-0">
             <div className="flex flex-col divide-y divide-border">
                {topExpensiveTasks.length > 0 ? (
                  topExpensiveTasks.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col gap-1 min-w-0 pr-4">
                        <span className="text-sm font-semibold text-foreground truncate print:text-black">{task.name}</span>
                        <span className="text-xs text-muted-foreground truncate print:text-black">Assignee: {task.assigneeId}</span>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-sm font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-md print:bg-transparent print:text-black print:border print:border-black">
                          {currency}{(task.budget || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground print:text-black">No budget assigned to tasks yet.</div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}