"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetSprints } from "@/features/sprints/api/use-get-sprints";
import { useCreateSprintModal } from "@/features/sprints/hooks/use-create-sprint-modal";
import SprintCard from "@/features/sprints/components/sprint-card";
import { SprintGantt } from "@/features/sprints/components/sprint-gantt";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, ListTodo, Grid, CalendarRange, CheckCircle, Clock, PlayCircle } from "lucide-react";
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
  const [view, setView] = useState<"grid" | "gantt">("grid");

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
      if (sprint.status === "PLANNED") acc.planned += 1;
      else if (sprint.status === "ACTIVE") acc.active += 1;
      else if (sprint.status === "CLOSED") acc.closed += 1;
      return acc;
    }, { total: 0, planned: 0, active: 0, closed: 0 });
  }, [data]);

  if (isLoading) return <div className="h-64 flex items-center justify-center"><PageLoader /></div>;
  if (error) return <div className="p-8 text-center text-destructive">Error loading sprints</div>;

  const hasSprints = data.length > 0;

  return (
    <div className="w-full p-4 lg:p-6 bg-background min-h-full">
      <CreateSprintModal />
      <div className="w-full space-y-6">
        {!hasSprints ? (
          <Card className="bg-card border-border shadow-sm mt-4 rounded-xl">
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="h-20 w-20 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-border">
                  <ListTodo className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No sprints yet</h3>
                <p className="text-sm font-medium text-muted-foreground mb-8 leading-relaxed">
                  Break down your project into manageable phases by creating your first sprint.
                </p>
                <Button onClick={() => open()} size="lg" className="bg-primary hover:bg-primary/90 shadow-md text-primary-foreground">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Sprint
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-card p-4 shadow-sm rounded-xl border border-border w-full">
              <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full lg:w-auto overflow-x-auto no-scrollbar">
                <StatCard icon={ListTodo} label="Total Sprints" value={stats.total} variant="primary" />
                <StatCard icon={Clock} label="Planned" value={stats.planned} variant="secondary" />
                <StatCard icon={PlayCircle} label="Active" value={stats.active} variant="primary" />
                <StatCard icon={CheckCircle} label="Closed" value={stats.closed} variant="success" />
              </div>

              {canCreateSprint && (
                <Button onClick={() => open()} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shrink-0 w-full sm:w-auto mt-2 lg:mt-0">
                  <Plus className="size-4 mr-2" />
                  New Sprint
                </Button>
              )}
            </div>

            <Card className="bg-card border-border shadow-sm rounded-xl w-full">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 w-full max-w-md relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search sprints..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 bg-background border-border transition-colors rounded-lg"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex gap-1 bg-muted p-1 rounded-lg border border-border">
                      <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" className={`h-8 w-8 ${view === "grid" ? "bg-background shadow-sm text-foreground" : "hover:bg-accent text-muted-foreground"}`} onClick={() => setView("grid")}>
                        <Grid className="size-4" />
                      </Button>
                      <Button variant={view === "gantt" ? "secondary" : "ghost"} size="icon" className={`h-8 w-8 ${view === "gantt" ? "bg-background shadow-sm text-foreground" : "hover:bg-accent text-muted-foreground"}`} onClick={() => setView("gantt")}>
                        <CalendarRange className="size-4" />
                      </Button>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-10 w-full md:w-auto border-border bg-background hover:bg-accent rounded-lg">
                          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground">Status:</span> <span className="font-semibold ml-1 text-foreground">{statusFilter === "all" ? "All" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                        {["all", "planned", "active", "closed"].map((status) => (
                          <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)} className="cursor-pointer font-medium text-foreground">
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>

              <CardContent className="p-4 lg:p-6 bg-muted/20 border-t border-border rounded-b-xl">
                {filteredSprints.length === 0 ? (
                  <div className="col-span-full p-12 flex flex-col items-center border-2 border-dashed border-muted rounded-xl bg-background">
                    <p className="text-muted-foreground font-medium">No sprints match your search.</p>
                  </div>
                ) : view === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                    {filteredSprints.map((sprint: any) => (
                      <Link
                        key={sprint.id}
                        href={`/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprint.id}`}
                        className="block focus:outline-none focus:ring-2 focus:ring-ring rounded-xl h-full w-full"
                      >
                        <SprintCard sprint={sprint} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="w-full overflow-hidden rounded-xl border bg-background shadow-sm">
                    <SprintGantt sprints={filteredSprints} />
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};