"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetSprints } from "@/features/sprints/api/use-get-sprints";
import { useCreateSprintModal } from "@/features/sprints/hooks/use-create-sprint-modal";
import SprintCard from "@/features/sprints/components/sprint-card";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, ListTodo, Grid, List, CheckCircle, AlertCircle, PauseCircle } from "lucide-react";
import { StatCard } from "@/components/stats-cards";
import { PageLoader } from "@/components/page-loader";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetPermissions } from "@/features/workspaces/api/use-get-permissions";
import { PERMISSIONS } from "@/lib/permissions-constants";
import { CreateSprintModal } from "@/features/sprints/components/create-sprint-modal";

export const SprintsPage = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();

  const { data = [], isLoading, error } = useGetSprints(projectId);
  const { open } = useCreateSprintModal();
  const { data: permissions } = useGetPermissions(workspaceId, projectId);
  const permissionsList: string[] = Array.isArray(permissions) ? permissions : [];

  const isWorkspaceOwner = permissionsList.includes(PERMISSIONS.WORKSPACE_DELETE);
  const canCreateSprint = isWorkspaceOwner || permissionsList.includes(PERMISSIONS.SPRINT_CREATE);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filteredSprints = useMemo(() => {
    return data.filter((sprint: any) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === "" ||
        sprint.name.toLowerCase().includes(searchLower) ||
        (sprint.goal && sprint.goal.toLowerCase().includes(searchLower)) ||
        (sprint.description && sprint.description.toLowerCase().includes(searchLower));
      const matchesStatus = statusFilter === "all" || sprint.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return data.reduce((acc: any, sprint: any) => {
      acc.total += 1;
      if (sprint.status === "ACTIVE") acc.active += 1;
      else if (sprint.status === "COMPLETED") acc.completed += 1;
      else if (sprint.status === "ON_HOLD") acc.onHold += 1;
      else if (sprint.status === "OVER_DUE") acc.overdue += 1;
      return acc;
    }, { total: 0, active: 0, completed: 0, onHold: 0, overdue: 0 });
  }, [data]);

  if (isLoading) return <div className="h-64 flex items-center justify-center"><PageLoader /></div>;
  if (error) return <div className="p-8 text-center text-destructive">Error loading sprints</div>;

  const hasSprints = data.length > 0;

  return (
    <div className="w-full p-4 bg-background min-h-full">
      <CreateSprintModal />
      <div className="max-w-7xl mx-auto space-y-4">
        {!hasSprints ? (
          <Card className="bg-card border-border shadow-sm mt-4">
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="h-20 w-20 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-border">
                  <ListTodo className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No sprints yet</h3>
                <p className="text-sm font-medium text-muted-foreground mb-8 leading-relaxed">
                  Break down your project into manageable phases by creating your first sprint.
                </p>
                <Button onClick={open} size="lg" className="bg-primary hover:bg-primary/90 shadow-md text-primary-foreground">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Sprint
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 items-center justify-between bg-card p-3 shadow-sm rounded-xl border border-border">
              <div className="flex flex-col sm:flex-row gap-2 flex-1 overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
                <StatCard icon={ListTodo} label="Total Sprints" value={stats.total} variant="primary" />
                <StatCard icon={ListTodo} label="Active" value={stats.active} variant="primary" />
                <StatCard icon={PauseCircle} label="On Hold" value={stats.onHold} variant="warning" />
                <StatCard icon={AlertCircle} label="Overdue" value={stats.overdue} variant="destructive" />
                <StatCard icon={CheckCircle} label="Completed" value={stats.completed} variant="success" />
              </div>

              {canCreateSprint && (
                                      <Button onClick={open} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shrink-0">
                                          <Plus className="size-4 mr-2" />
                                          New Sprint
                                      </Button>
                                      )}
            </div>

            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-3">
                <div className="flex flex-col md:flex-row gap-3 items-center">
                  <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search sprints..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 bg-background border-border transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex gap-1 bg-muted p-1 rounded-lg border border-border">
                      <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" className={`h-8 w-8 ${view === "grid" ? "bg-background shadow-sm text-foreground" : "hover:bg-accent text-muted-foreground"}`} onClick={() => setView("grid")}>
                        <Grid className="size-4" />
                      </Button>
                      <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" className={`h-8 w-8 ${view === "list" ? "bg-background shadow-sm text-foreground" : "hover:bg-accent text-muted-foreground"}`} onClick={() => setView("list")}>
                        <List className="size-4" />
                      </Button>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-10 w-full md:w-auto border-border bg-background hover:bg-accent">
                          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground">Status:</span> <span className="font-semibold ml-1 text-foreground">{statusFilter === "all" ? "All" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                        {["all", "active", "completed", "on-hold", "overdue"].map((status) => (
                          <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)} className="cursor-pointer font-medium text-foreground">
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>

              <CardContent className={`p-4 bg-muted/30 border-t border-border ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}`}>
                {filteredSprints.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-muted-foreground font-medium">No sprints match your search.</div>
                ) : (
                  filteredSprints.map((sprint: any) => (
                    <Link
                      key={sprint.id}
                      href={`/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprint.id}`}
                      className={`block focus:outline-none focus:ring-2 focus:ring-ring rounded-xl ${view === 'grid' ? 'h-full' : ''}`}
                    >
                      <SprintCard sprint={sprint} view={view} />
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};