"use client";

import React, { useMemo } from "react";
import { format } from "date-fns";
import { 
  Bot, CalendarClock, Activity, Wallet, ShieldAlert, CheckCircle2, 
  ListTodo, Clock, Lightbulb, Wifi, WifiOff, AlertCircle, Zap, Users, Calendar, TrendingUp, Sparkles, Goal,
  Target
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PageLoader } from "@/components/page-loader";

import { useProjectEstimations } from "../hooks/use-project-estimations";
import { ActivityTimeline } from "@/features/activity-logs/components/activity-timeline";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "./project-avatar";

export const ProjectOverview = ({ analytics, logs }: { analytics: any, logs: any }) => {
  
  const actualPayload = analytics?.data || analytics || {};
  const aiInsights = useProjectEstimations(actualPayload);

  const meta = actualPayload.meta || {};
  const kpi = actualPayload.kpi || { effortProgress: 0, budgetRemaining: 0 };
  const risks = actualPayload.risks || [];
  const members = actualPayload.members || [];
  const tasks = actualPayload.tasks || [];
  const sprints = actualPayload.sprints || [];
  const safeLogs = Array.isArray(logs) ? logs : (logs?.data || []);

  const activeRisks = risks.filter((r: any) => r.status === "OPEN" || r.status === "IN_PROGRESS");
  const closedRisksCount = risks.length - activeRisks.length;
  
  const impactWeights: Record<string, number> = { "CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1 };
  const displayRisks = [...activeRisks].sort((a: any, b: any) => (impactWeights[b.impact || "LOW"] || 0) - (impactWeights[a.impact || "LOW"] || 0)).slice(0, 5);
  
  const pendingTasks = tasks.filter((t: any) => t.progress < 100);
  const activeSprint = sprints.find((s: any) => s.status === "ACTIVE");
  const isAiActive = aiInsights?.isAiPowered || false;

  // ========================================================
  // SMART AI SUGGESTIONS ENGINE
  // ========================================================
  const smartSuggestions = useMemo(() => {
    const suggestions = [];

    // 1. Idle Resources
    const freeMembers = members.filter((m: any) => m.totalTasks === 0 || m.tasksCompleted === m.totalTasks);
    if (freeMembers.length > 0 && pendingTasks.length > 0) {
      suggestions.push({
        id: "idle_resource", type: "action", icon: Users, title: "Idle Resources Detected",
        desc: `${freeMembers.map((m: any) => m.name.split(' ')[0]).join(', ')} currently ${freeMembers.length > 1 ? 'have' : 'has'} no active tasks. Consider assigning from the backlog.`
      });
    }

    // 2. Unassigned Critical Tasks
    const unassignedUrgent = pendingTasks.filter((t: any) => t.assigneeId === "Unassigned" && (t.priority === "URGENT" || t.priority === "HIGH"));
    if (unassignedUrgent.length > 0) {
      suggestions.push({
        id: "unassigned_urgent", type: "urgent", icon: AlertCircle, title: "Critical Tasks Unassigned",
        desc: `There are ${unassignedUrgent.length} High/Urgent priority tasks sitting without an assignee. Address immediately.`
      });
    }

    // 3. Active Risk Warning
    const criticalOpenRisks = activeRisks.filter((r: any) => r.impact === "CRITICAL");
    if (criticalOpenRisks.length > 0) {
       suggestions.push({
        id: "critical_risk", type: "urgent", icon: ShieldAlert, title: "Critical Project Risk",
        desc: `${criticalOpenRisks.length} critical risk(s) demand immediate mitigation to prevent timeline or budget overflow.`
      });
    }

    // 4. Sprint Capacity vs Load
    if (activeSprint) {
        const sprintPendingTasks = pendingTasks.filter((t: any) => t.sprintId === activeSprint.id);
        const currentSprintLoad = sprintPendingTasks.reduce((acc: number, t: any) => acc + (t.effortPoints || 0), 0);
        
        if (activeSprint.capacityPoints && currentSprintLoad > activeSprint.capacityPoints) {
            suggestions.push({
                id: "sprint_overload", type: "urgent", icon: Zap, title: "Sprint Overload Predicted",
                desc: `Current active sprint is overloaded. Workload (${currentSprintLoad} pts) exceeds defined capacity (${activeSprint.capacityPoints} pts). Consider pushing tasks to backlog.`
            });
        } else if (activeSprint.capacityPoints && currentSprintLoad < (activeSprint.capacityPoints * 0.7)) {
             suggestions.push({
                id: "sprint_underload", type: "insight", icon: Target, title: "Sprint Capacity Available",
                desc: `Active sprint has remaining capacity. You can safely pull ${activeSprint.capacityPoints - currentSprintLoad} more effort points from the backlog.`
            });
        }
    }

    return suggestions;
  }, [members, pendingTasks, activeRisks, activeSprint]);

  if (!analytics || Object.keys(actualPayload).length === 0) {
      return <div className="flex items-center justify-center h-[50vh] w-full"><PageLoader /></div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full p-4 lg:p-6 bg-background">
      
      {/* HEADER: AGILE & AI STATUS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card border border-border rounded-xl p-4 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <ProjectAvatar name={meta.name} className="size-10" image={meta.ImageUrl} />
          <div>
            <h2 className="text-lg font-bold leading-none">{meta.name} <span className="text-muted-foreground font-normal text-sm ml-2">Overview</span></h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">{meta.projectStatus?.replace(/_/g, " ")}</span>
              {isAiActive ? (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center">
                  <Sparkles className="size-3 mr-1" /> AI Engine Online
                </span>
              ) : (
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded flex items-center">
                  <WifiOff className="size-3 mr-1" /> Math Fallback
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="text-right">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Execution</p>
            <div className="flex items-center gap-3">
              <Progress value={meta.progress} className="w-24 md:w-32 h-2" />
              <span className="text-lg font-bold text-foreground">{meta.progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* INTELLIGENT SUGGESTIONS (SCROLLABLE ROW) */}
      {smartSuggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 px-1">
            <Lightbulb className="size-4 text-amber-500" /> Smart Suggestions
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {smartSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className={`shrink-0 w-[300px] md:w-[350px] shadow-sm border-l-4 ${
                suggestion.type === 'urgent' ? 'border-l-rose-500 bg-rose-500/5' : 
                suggestion.type === 'action' ? 'border-l-blue-500 bg-blue-500/5' : 'border-l-emerald-500 bg-emerald-500/5'
              }`}>
                <CardContent className="p-4 flex gap-3 h-full">
                  <div className={`p-2 rounded-full h-fit shrink-0 ${
                    suggestion.type === 'urgent' ? 'bg-rose-500/20 text-rose-600' : 
                    suggestion.type === 'action' ? 'bg-blue-500/20 text-blue-600' : 'bg-emerald-500/20 text-emerald-600'
                  }`}>
                    <suggestion.icon className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-bold text-foreground line-clamp-1">{suggestion.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-3 leading-relaxed">{suggestion.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* QUICK METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
               {isAiActive ? <Bot className="size-3 text-indigo-500" /> : <Clock className="size-3" />} Estimated Deadline
            </span>
            <span className={`text-xl font-bold ${aiInsights?.isDelayed ? 'text-rose-600' : 'text-foreground'}`}>
              {aiInsights?.isDelayed ? 'Delayed' : 'On Track'}
            </span>
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-1">
              <Calendar className="size-3" /> 
              {aiInsights?.projectedDate ? format(new Date(aiInsights.projectedDate), "dd MMM yyyy") : 'Pending...'}
            </span>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
               <Wallet className="size-3" /> Budget Health
            </span>
            <span className={`text-xl font-bold ${
              aiInsights?.budgetRisk === "CRITICAL" ? "text-rose-600" : 
              aiInsights?.budgetRisk === "WARNING" ? "text-amber-600" : "text-foreground"
            }`}>
              {aiInsights?.budgetRisk || "SAFE"}
            </span>
            <span className="text-xs text-muted-foreground font-medium truncate mt-1">
              {meta.currency || "PKR"} {aiInsights?.projectedBudgetVariance?.toLocaleString() || 0} variance
            </span>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
               <TrendingUp className="size-3" /> Burn Velocity
            </span>
            <span className="text-xl font-bold text-foreground">
              {aiInsights?.velocity.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">pts/day</span>
            </span>
            <span className="text-xs text-muted-foreground font-medium mt-1">
              {aiInsights?.pointsRemaining} points remaining
            </span>
          </CardContent>
        </Card>

        {activeSprint ? (
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl border-l-4 border-l-primary bg-primary/5">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1 mb-1">
                 <Goal className="size-3" /> Active Sprint Health
              </span>
              <span className="text-xl font-bold text-foreground truncate" title={activeSprint.name}>
                {activeSprint.name}
              </span>
              <div className="flex items-center gap-2 mt-1">
                 <Progress value={activeSprint.progress} className="h-1.5 flex-1 bg-primary/20" />
                 <span className="text-xs font-bold text-primary">{activeSprint.progress}%</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl border-dashed border-2 bg-muted/20">
            <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center">
              <span className="text-xs font-bold text-muted-foreground uppercase mb-1">Active Sprint</span>
              <span className="text-sm font-medium text-muted-foreground">No active sprint found</span>
            </CardContent>
          </Card>
        )}
      </div>

      {/* LOWER DASHBOARD: TASKS, RISKS, FEED */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* TASKS PIPELINE */}
          <Card className="shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2 font-bold">
                <ListTodo className="size-4 text-primary" /> Pending Action Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pendingTasks.length > 0 ? (
                <div className="divide-y divide-border">
                  {pendingTasks.slice(0, 6).map((task: any) => (
                    <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`px-2 py-0.5 text-[9px] uppercase border-none ${
                          task.priority === "URGENT" ? "bg-rose-500/10 text-rose-600" : 
                          task.priority === "HIGH" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                        }`}>
                          {task.priority}
                        </Badge>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{task.name}</span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {task.assigneeId || "Unassigned"} • {task.effortPoints || 1} pts
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold">{task.column?.name || "Pending"}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 flex flex-col items-center justify-center border-2 border-dashed border-muted m-4 rounded-xl">
                  <CheckCircle2 className="size-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-bold text-muted-foreground">Inbox Zero</p>
                  <p className="text-xs text-muted-foreground mt-1">No pending tasks in the pipeline.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ACTIVE RISKS */}
          <Card className="shadow-sm rounded-xl border-rose-500/10">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b bg-rose-500/5">
              <CardTitle className="text-base flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
                <ShieldAlert className="size-4" /> Immediate Risk Register
              </CardTitle>
              <div className="flex items-center gap-2">
                {closedRisksCount > 0 && <span className="text-[10px] font-bold text-muted-foreground">{closedRisksCount} Resolved</span>}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {displayRisks.length > 0 ? (
                <div className="divide-y divide-border">
                  {displayRisks.map((risk: any) => (
                    <div key={risk.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                      <div className="flex flex-col">
                        <h4 className="font-semibold text-sm">{risk.title}</h4>
                        <div className="flex gap-2 mt-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${risk.impact === 'CRITICAL' ? 'text-rose-600 bg-rose-500/10' : 'text-amber-600 bg-amber-500/10'}`}>
                            Impact: {risk.impact}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">Prob: {risk.probability}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-muted m-4 rounded-xl">
                  <p className="text-sm font-bold">Project Stable</p>
                  <p className="text-xs mt-1">No active risks identified.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ACTIVITY FEED */}
        <div className="flex flex-col">
          <Card className="shadow-sm h-full flex flex-col rounded-xl">
            <CardHeader className="py-4 shrink-0 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2 font-bold">
                <CalendarClock className="size-4 text-muted-foreground" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-hidden">
              <div className="h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {safeLogs.length > 0 ? (
                  <ActivityTimeline logs={safeLogs.slice(0, 20)} />
                ) : (
                  <div className="mt-10 text-center border-2 border-dashed border-muted p-6 rounded-xl">
                    <p className="text-xs font-bold text-muted-foreground">No recent activity.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};