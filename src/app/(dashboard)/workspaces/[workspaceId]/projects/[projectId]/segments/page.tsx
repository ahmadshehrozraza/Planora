"use client";

import { useState } from "react";
import Link from "next/link";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetDummySegmentsByProject } from "@/features/segments/api/use-get-dummy-segments";
import SegmentCard from "@/features/segments/components/segmentsCard";
import { CreateSegmentModal } from "@/features/segments/components/create-segment-modal";
import { useCreateSegmentModal } from "@/features/segments/hooks/use-create-segment-modal";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Plus,
  Search,
  Filter,
  ListTodo,
  Grid,
  List,
  CheckCircle,
  AlertCircle,
  PauseCircle,
} from "lucide-react";

import { StatCard } from "@/components/stats-cards";
import { useGetSegments } from "@/features/segments/api/use-get-segment";

export const SegmentsPage = () => {
  const projectId = useProjectId();
  const { data, isLoading, error } = useGetSegments(projectId);
  const { open } = useCreateSegmentModal();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  if (isLoading) {
    return <div>Loading segments...</div>;
  }

  if (error) {
    return <div>Error loading segments: {error.message}</div>;
  }

  const segments = data?.documents || [];
  const hasSegments = segments.length > 0;

  const filteredSegments = segments.filter((segment) => {
    const matchesSearch =
      searchQuery === "" ||
      segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      segment.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      segment.segmentStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalSegments = segments.length;
  const activeSegments = segments.filter((s) => s.segmentStatus === "ACTIVE").length;
  const completedSegments = segments.filter((s) => s.segmentStatus === "COMPLETED").length;
  const onHoldSegments = segments.filter((s) => s.segmentStatus === "ON_HOLD").length;
  const overdueSegments = segments.filter((s) => s.segmentStatus === "OVER_DUE").length;

  return (
    <div className="w-full bg-gray-50/50">
      <div className="mx-auto">
        <CreateSegmentModal />

        {!hasSegments ? (
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="h-20 w-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <ListTodo className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No segments yet
                </h3>
                <p className="text-gray-500 mb-8">
                  Create your first segment to get started with project management
                </p>
                <Button
                  onClick={open}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Segment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 items-center justify-between bg-white p-2 mb-4 shadow-sm rounded-lg border">
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <StatCard icon={ListTodo} label="Total Segments" value={totalSegments} color="blue" />
                <StatCard icon={ListTodo} label="Active" value={activeSegments} color="amber" />
                <StatCard icon={PauseCircle} label="On Hold" value={onHoldSegments} color="orange" />
                <StatCard icon={AlertCircle} label="Overdue" value={overdueSegments} color="red" />
                <StatCard icon={CheckCircle} label="Completed" value={completedSegments} color="green" />
              </div>
            </div>

            <Card className="bg-white border shadow-sm mb-3">
              <CardContent className="p-3 rounded-none">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search segments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                  {view === "list" ? ( 
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setView("grid")}
                    >
                      <Grid size={4} />
                    </Button>

                    ) : (

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setView("list")}
                    >
                      <List size={4} />
                    </Button>

                    )}
                  <div className="w-full md:w-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-11 w-full md:w-auto">
                          <Filter className="h-4 w-4 mr-2" />
                          Status:{" "}
                          {statusFilter === "all"
                            ? "All"
                            : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {["all", "active", "completed", "on-hold", "overdue"].map((status) => (
                          <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)} Segments
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>

              {view === "list" ? (
                <CardContent className="p-3 space-y-2">
                  {filteredSegments.map((segment) => (
                    <Link key={segment.id} href={`${projectId}/segments/${segment.id}`} className="block">
                      <SegmentCard segment={segment} view={view} />
                    </Link>
                  ))}
                </CardContent>
              ) : (
                <CardContent className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border-none">
                  {filteredSegments.map((segment) => (
                    <Link key={segment.id} href={`${projectId}/segments/${segment.id}`} className="block">
                      <SegmentCard segment={segment} view={view} />
                    </Link>
                  ))}
                </CardContent>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default SegmentsPage;
