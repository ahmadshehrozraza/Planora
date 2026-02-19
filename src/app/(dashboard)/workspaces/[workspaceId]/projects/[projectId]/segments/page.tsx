"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetSegments } from "@/features/segments/api/use-get-segment";
import { CreateSegmentModal } from "@/features/segments/components/create-segment-modal";
import { useCreateSegmentModal } from "@/features/segments/hooks/use-create-segment-modal";
import SegmentCard from "@/features/segments/components/segmentsCard";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, ListTodo, Grid, List, CheckCircle, AlertCircle, PauseCircle } from "lucide-react";
import { StatCard } from "@/components/stats-cards";
import { PageLoader } from "@/components/page-loader";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const SegmentsPage = () => {

  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const { data, isLoading, error } = useGetSegments(projectId);
  const { open } = useCreateSegmentModal();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filteredSegments = useMemo(() => {
    const segs = data?.documents || [];
    return segs.filter((segment) => {
      const matchesSearch =
        searchQuery === "" ||
        segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (segment.description && segment.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        segment.segmentStatus?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [data?.documents, searchQuery, statusFilter]);

  const stats = useMemo(() => {
     const segs = data?.documents || [];
     return {
        total: segs.length,
        active: segs.filter((s) => s.segmentStatus === "ACTIVE").length,
        completed: segs.filter((s) => s.segmentStatus === "COMPLETED").length,
        onHold: segs.filter((s) => s.segmentStatus === "ON_HOLD").length,
        overdue: segs.filter((s) => s.segmentStatus === "OVER_DUE").length,
     }
  }, [data?.documents]);

  if (isLoading) return <div className="h-64 flex items-center justify-center"><PageLoader /></div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading segments: {error.message}</div>;

  const hasSegments = (data?.documents?.length || 0) > 0;

  return (
    <div className="w-full p-4 sm:p-6 bg-slate-50/50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-4">

        {!hasSegments ? (
          <Card className="bg-white border-slate-200 shadow-sm mt-4">
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="h-20 w-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-200">
                  <ListTodo className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No segments yet</h3>
                <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                  Break down your project into manageable phases by creating your first segment.
                </p>
                <Button onClick={open} size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-md text-white">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Segment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>

            <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-3 shadow-sm rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row gap-2 flex-1 overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
                    <StatCard icon={ListTodo} label="Total Segments" value={stats.total} color="blue" />
                    <StatCard icon={ListTodo} label="Active" value={stats.active} color="amber" />
                    <StatCard icon={PauseCircle} label="On Hold" value={stats.onHold} color="orange" />
                    <StatCard icon={AlertCircle} label="Overdue" value={stats.overdue} color="red" />
                    <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="green" />
                </div>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-3">
                <div className="flex flex-col md:flex-row gap-3 items-center">
                  <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search segments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <Button
                        variant={view === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        className={`h-8 w-8 ${view === "grid" ? "bg-white shadow-sm" : "hover:bg-slate-200"}`}
                        onClick={() => setView("grid")}
                      >
                        <Grid className="size-4 text-slate-700" />
                      </Button>
                      <Button
                        variant={view === "list" ? "secondary" : "ghost"}
                        size="icon"
                        className={`h-8 w-8 ${view === "list" ? "bg-white shadow-sm" : "hover:bg-slate-200"}`}
                        onClick={() => setView("list")}
                      >
                        <List className="size-4 text-slate-700" />
                      </Button>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-10 w-full md:w-auto border-slate-200 bg-slate-50 hover:bg-slate-100">
                          <Filter className="h-4 w-4 mr-2 text-slate-500" />
                          Status: <span className="font-semibold ml-1 text-slate-700">{statusFilter === "all" ? "All" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                        {["all", "active", "completed", "on-hold", "overdue"].map((status) => (
                          <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)} className="cursor-pointer font-medium text-slate-700">
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>

              <CardContent className={`p-4 bg-slate-50/50 border-t border-slate-100 ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}`}>
                {filteredSegments.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-slate-500 font-medium">No segments match your search.</div>
                ) : (
                  filteredSegments.map((segment) => (
                    <Link
                      key={segment.id}
                      href={`/workspaces/${workspaceId}/projects/${projectId}/segments/${segment.id}`} 
                      className={`block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl ${view === 'grid' ? 'h-full' : ''}`}
                    >
                      <SegmentCard segment={segment} view={view} />
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