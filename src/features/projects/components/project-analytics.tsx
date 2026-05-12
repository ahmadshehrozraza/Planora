"use client";

import React, { useMemo } from "react";
import { 
  PieChart, Pie, Label, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, 
  Tooltip as RechartsTooltip, Legend
} from "recharts";
import { 
  Banknote, Calendar, Target, Download, FileSpreadsheet, FileText, 
  BrainCircuit, ShieldAlert, Calculator, GitMerge, Users, AlertOctagon, Trophy, Briefcase 
} from "lucide-react";
import { format } from "date-fns";
import { PDFDownloadLink } from "@react-pdf/renderer";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge"; 
import { PageLoader } from "@/components/page-loader";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { BurndownChart } from "@/components/burndown-chart";
import { CumulativeFlow } from "@/components/cumulative-flow";
import { VelocityChart } from "@/components/velocity-chart";
import { VerticalBarChart } from "@/features/dashboard/components/vertical-bar-chart";
import { useGetProjectAnalytics } from "@/features/projects/api/use-get-project-analytics";
import { useProjectEstimations } from "../hooks/use-project-estimations";
import { ProjectAvatar } from "./project-avatar";
import { MemberAvatar } from "@/features/members/components/member-avatar";

import { exportProjectToExcel } from "@/lib/export-excel";
import { ProjectReportPDF } from "./project-report-pdf";

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#64748b", "#a855f7", "#ef4444"];
const RISK_COLORS: Record<string, string> = { "CRITICAL": "#e11d48", "HIGH": "#f59e0b", "MEDIUM": "#3b82f6", "LOW": "#10b981" };
const PRIORITY_COLORS: Record<string, string> = { "URGENT": "#e11d48", "HIGH": "#f59e0b", "MEDIUM": "#3b82f6", "LOW": "#10b981" };

export default function ProjectAnalytics({ projectId }: { projectId: string }) {
  const { data: analytics, isLoading } = useGetProjectAnalytics({ projectId });
  const predictions = useProjectEstimations(analytics);

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

  const riskProfileData = useMemo(() => {
     if (!analytics?.risks) return [];
     const profile = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
     analytics.risks.forEach((r: any) => {
        if (r.status !== "CLOSED" && r.status !== "MITIGATED") {
            profile[r.impact as keyof typeof profile] = (profile[r.impact as keyof typeof profile] || 0) + 1;
        }
     });
     return [
       { impact: "CRITICAL", count: profile.CRITICAL, fill: RISK_COLORS.CRITICAL },
       { impact: "HIGH", count: profile.HIGH, fill: RISK_COLORS.HIGH },
       { impact: "MEDIUM", count: profile.MEDIUM, fill: RISK_COLORS.MEDIUM },
       { impact: "LOW", count: profile.LOW, fill: RISK_COLORS.LOW }
     ].filter(r => r.count > 0);
  }, [analytics]);

  const priorityDistributionData = useMemo(() => {
    if (!analytics?.tasks) return [];
    const profile = { URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    analytics.tasks.forEach((t: any) => {
       profile[t.priority as keyof typeof profile] = (profile[t.priority as keyof typeof profile] || 0) + 1;
    });
    return [
      { priority: "URGENT", count: profile.URGENT, fill: PRIORITY_COLORS.URGENT },
      { priority: "HIGH", count: profile.HIGH, fill: PRIORITY_COLORS.HIGH },
      { priority: "MEDIUM", count: profile.MEDIUM, fill: PRIORITY_COLORS.MEDIUM },
      { priority: "LOW", count: profile.LOW, fill: PRIORITY_COLORS.LOW }
    ].filter(p => p.count > 0);
  }, [analytics]);

  // THIS IS THE MISSING WORKLOAD DATA HOOK
  const workloadData = useMemo(() => {
    if (!analytics?.members || !analytics?.tasks) return [];
    return analytics.members.map((m: any) => {
      const memberTasks = analytics.tasks.filter((t: any) => t.assigneeId === m.name);
      const totalPoints = memberTasks.reduce((acc: number, t: any) => acc + (t.effortPoints || 0), 0);
      const completedPoints = memberTasks.filter((t: any) => t.progress === 100).reduce((acc: number, t: any) => acc + (t.effortPoints || 0), 0);
      return {
        name: m.name.split(' ')[0], 
        completed: completedPoints,
        pending: Math.max(0, totalPoints - completedPoints)
      };
    }).filter((m: any) => m.completed > 0 || m.pending > 0);
  }, [analytics]);

  const leaderboardData = useMemo(() => {
    if (!analytics?.members) return [];
    return [...analytics.members]
      .filter((m: any) => m.pointsEarned > 0)
      .sort((a: any, b: any) => b.pointsEarned - a.pointsEarned)
      .slice(0, 5)
      .map((m: any) => ({
         name: m.name.split(' ')[0],
         points: m.pointsEarned,
         fill: "hsl(var(--primary))"
      }));
  }, [analytics]);

  if (isLoading || !analytics || !predictions) return <div className="h-[60vh] flex items-center justify-center"><PageLoader /></div>;

  const { meta, sprints, kpi, charts, risks, members } = analytics;
  const currency = meta.currency || "PKR";
  const isAiActive = predictions.isAiPowered;

  const handleExportExcel = () => {
    exportProjectToExcel(analytics, meta.name);
  };

  const priorityConfig = { count: { label: "Tasks" } } satisfies ChartConfig;

  const workloadConfig = {
    completed: { label: "Completed Pts", color: "hsl(var(--primary))" },
    pending: { label: "Pending Pts", color: "hsl(var(--muted-foreground))" }
  } satisfies ChartConfig;

  return (
    <div className="w-full p-4 lg:p-6 space-y-8 bg-background">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-3">
            <ProjectAvatar name={meta.name} className="size-12" image={meta.ImageUrl} />
            <h1 className="text-2xl font-bold text-foreground">{meta.name}</h1>
            {isAiActive && (
               <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 ml-2">
                 <span className="flex">
                    <BrainCircuit className="size-4 mr-1" /> AI Engine Active
                 </span>
               </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-muted-foreground">
              <Badge variant="outline" className="text-sm px-3 py-1 font-medium">{meta.projectStatus.replace(/_/g, " ")}</Badge>
              <span>•</span>
              <span className="flex items-center gap-2 font-medium">
                  <Calendar className="size-4" />
                  {meta.startDate ? format(new Date(meta.startDate), "MMM d, yyyy") : "N/A"} - {meta.dueDate ? format(new Date(meta.dueDate), "MMM d, yyyy") : "N/A"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-2 font-medium">
                 <ShieldAlert className="size-4" /> {risks?.length || 0} Total Risks Logged
              </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all w-full md:w-auto">
                <Download className="size-4 mr-2" /> Generate Executive Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <PDFDownloadLink 
                 document={<ProjectReportPDF analytics={analytics} predictions={predictions} />} 
                 fileName={`${meta.name.replace(/\s+/g, '_')}_Executive_Report.pdf`}
              >
                {({ loading }) => (
                  <DropdownMenuItem className="cursor-pointer" disabled={loading}>
                    <FileText className="size-4 mr-2" />
                    {loading ? "Compiling ML Data..." : "Export as PDF Report"}
                  </DropdownMenuItem>
                )}
              </PDFDownloadLink>
              <DropdownMenuItem className="cursor-pointer" onClick={handleExportExcel}>
                <FileSpreadsheet className="size-4 mr-2" /> Export Raw Data (Excel)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-right bg-muted/30 p-4 rounded-xl border border-border min-w-[250px] shadow-sm w-full md:w-auto">
            <p className="text-sm font-semibold text-muted-foreground mb-1">Execution Progress</p>
            <div className="flex items-center gap-3 justify-end">
              <span className="text-4xl font-bold text-foreground">{meta.progress}%</span>
            </div>
            <Progress value={meta.progress} className="w-full h-2 mt-3 transition-all duration-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-l-4 border-l-slate-400 bg-slate-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <Target className="size-4" /> Planned (Original Target)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Allocated Budget</p>
                <p className="text-xl font-bold">{currency} {(meta.budget || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Target Deadline</p>
                <p className="text-lg font-semibold">{meta.dueDate ? format(new Date(meta.dueDate), "dd MMM yyyy") : "Not Set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Calculator className="size-4" /> COCOMO Baseline
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-3 mt-2">
              <div>
                <p className="text-xs text-blue-700/70 dark:text-blue-400/70 uppercase font-bold">Calculated Cost</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                  {meta.calculatedCost > 0 ? `${currency} ${meta.calculatedCost.toLocaleString()}` : "Not Calculated"}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700/70 dark:text-blue-400/70 uppercase font-bold">Calculated Effort</p>
                <p className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                  {meta.calculatedEffort > 0 ? `${meta.calculatedEffort} Person-Months` : "Not Calculated"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-indigo-500 bg-indigo-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
              <BrainCircuit className="size-4" /> Live AI Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-3 mt-2">
              <div>
                <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70 uppercase font-bold">Est. Final Cost</p>
                <p className={`text-xl font-bold ${predictions.projectedBudgetVariance < 0 ? 'text-rose-600' : 'text-indigo-700 dark:text-indigo-400'}`}>
                  {currency} {predictions.projectedTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70 uppercase font-bold">Est. Finish Date</p>
                <p className={`text-lg font-semibold ${predictions.isDelayed ? 'text-rose-600' : 'text-indigo-700 dark:text-indigo-400'}`}>
                  {predictions.projectedDate ? format(new Date(predictions.projectedDate), "dd MMM yyyy") : "Pending"}
                  {predictions.isDelayed && ` (+${predictions.delayDays}d)`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <BurndownChart data={charts.burndown} />
        <VelocityChart data={charts.velocity} />
        <div className="lg:col-span-2"><CumulativeFlow data={charts.cfd} config={cfdConfig} /></div>
      </div>

      <div className="space-y-6 mt-8">
        <div className="border-b pb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
             <Users className="size-6 text-primary" /> Team Performance Matrix
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Detailed overview of member contributions, velocity, and workload.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm border-border lg:col-span-2">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-base flex items-center gap-2"><Briefcase className="size-4 text-primary" /> Resource Distribution Data</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead className="text-center">Assigned Tasks</TableHead>
                      <TableHead className="text-center">Completion Rate</TableHead>
                      <TableHead className="text-center">Points Earned</TableHead>
                      <TableHead className="text-right">Budget Managed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.length > 0 ? members.map((member: any) => {
                      const completionRate = member.totalTasks > 0 ? Math.round((member.tasksCompleted / member.totalTasks) * 100) : 0;
                      return (
                        <TableRow key={member.memberId}>
                          <TableCell className="flex items-center gap-3">
                            <MemberAvatar name={member.name} src={member.image} className="size-8" />
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{member.name}</span>
                              <span className="text-[10px] text-muted-foreground uppercase">{member.role}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-medium">{member.totalTasks}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-xs font-semibold">{completionRate}%</span>
                              <Progress value={completionRate} className="h-1.5 w-16" />
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-primary">{member.pointsEarned} pts</TableCell>
                          <TableCell className="text-right font-medium text-muted-foreground">
                            {currency}{member.budgetManaged.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      )
                    }) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No members assigned to this project yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border col-span-1">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-base flex items-center gap-2"><Trophy className="size-4 text-amber-500" /> Top Performers</CardTitle>
              <CardDescription className="text-xs">Based on effort points delivered</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
               {leaderboardData.length > 0 ? (
                 <ChartContainer config={{}} className="h-[250px] w-full">
                   <BarChart data={leaderboardData} layout="vertical" margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
                     <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                     <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                     <Bar dataKey="points" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 'bold' }}>
                       {leaderboardData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.fill} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ChartContainer>
               ) : (
                 <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border-2 border-dashed rounded-xl m-2">
                   <Trophy className="size-8 opacity-20 mb-2" />
                   <p className="text-sm font-medium">No effort points delivered yet</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="size-5 text-primary" /> Resource Allocation</CardTitle>
            <CardDescription>Effort points assigned vs completed per member</CardDescription>
          </CardHeader>
          <CardContent>
            {workloadData.length > 0 ? (
              <ChartContainer config={workloadConfig} className="h-[280px] w-full">
                <BarChart data={workloadData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <RechartsTooltip cursor={{ fill: "var(--theme-muted)", opacity: 0.2 }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="completed" name="Completed Pts" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} maxBarSize={40} />
                  <Bar dataKey="pending" name="Pending Pts" stackId="a" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground border-2 border-dashed rounded-xl m-2">
                <Users className="size-8 opacity-20 mb-2" />
                <p className="text-sm font-medium">No workload data</p>
              </div>
            )}
          </CardContent>
        </Card>

        <VerticalBarChart data={sprints} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        <Card className="shadow-sm border-border col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GitMerge className="size-5 text-primary" /> Task Breakdown</CardTitle>
            <CardDescription>Current status across all {kpi.totalTasks} tasks</CardDescription>
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
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">{kpi.totalTasks}</tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-xs">Total Tasks</tspan>
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

        <div className="col-span-1 flex flex-col gap-6">
          <Card className="shadow-sm border-border flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><AlertOctagon className="size-4 text-rose-500" /> Priority Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
               {priorityDistributionData.length > 0 ? (
                 <ChartContainer config={priorityConfig} className="mx-auto aspect-square max-h-[160px] mt-2">
                   <PieChart>
                     <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                     <Pie data={priorityDistributionData} dataKey="count" nameKey="priority" innerRadius={40} outerRadius={70} strokeWidth={2} stroke="var(--background)">
                       {priorityDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                       ))}
                     </Pie>
                   </PieChart>
                 </ChartContainer>
               ) : (
                 <div className="flex flex-col items-center justify-center h-[160px] text-muted-foreground border-2 border-dashed rounded-xl m-2">
                   <p className="text-xs font-medium">No priority data</p>
                 </div>
               )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="size-4 text-amber-500" /> Risk Profile</CardTitle>
            </CardHeader>
            <CardContent>
               {riskProfileData.length > 0 ? (
                 <ChartContainer config={{}} className="h-[140px] w-full mt-2">
                   <BarChart data={riskProfileData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                     <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="impact" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                     <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                     <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                       {riskProfileData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.fill} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ChartContainer>
               ) : (
                 <div className="flex flex-col items-center justify-center h-[140px] text-muted-foreground border-2 border-dashed rounded-xl m-2">
                   <p className="text-xs font-medium">No active risks</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border-border col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Banknote className="size-5 text-emerald-600" /> Cost Breakdown</CardTitle>
            <CardDescription>Highest budget consuming tasks.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 p-0">
             <div className="flex flex-col divide-y divide-border">
                {topExpensiveTasks.length > 0 ? (
                  topExpensiveTasks.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col gap-1 min-w-0 pr-4">
                        <span className="text-sm font-semibold text-foreground truncate">{task.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{task.assigneeId || 'Unassigned'}</span>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-sm font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md">
                          {currency}{(task.budget || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-xl m-4">No budget assigned to tasks yet.</div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}