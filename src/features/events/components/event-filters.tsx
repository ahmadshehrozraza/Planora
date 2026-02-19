"use client";

import { FolderIcon, X, CalendarIcon, Layers } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import { useEventFilters } from "../hooks/use-event-filters";
import { useGetDummyProjects } from "@/features/projects/api/use-get-dummy-projects";
import { useGetDummySegmentsByProject } from "@/features/segments/api/use-get-dummy-segments"; // 👈 Import Segment Hook
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const EventFilters = () => {
  const workspaceId = useWorkspaceId();
  
  // 1. Hook se filters (ab segmentId bhi include hai)
  const [{ projectId, segmentId, date }, setFilters] = useEventFilters();

  // 2. Fetch Projects
  const { data: projects, isLoading: isLoadingProjects } = useGetDummyProjects(workspaceId);

  // 3. Fetch Segments (Based on selected Project)
  // Agar projectId null hai, to undefined pass karein taake hook call na ho ya empty return kare
  const { data: segments, isLoading: isLoadingSegments } = useGetDummySegmentsByProject(
    projectId || undefined
  );

  const isLoading = isLoadingProjects || isLoadingSegments;

  // Options Mapping
  const projectOptions = projects?.documents?.map((project) => ({
    value: project.id,
    label: project.name,
  })) || [];

  const segmentOptions = segments?.documents?.map((segment) => ({
    value: segment.id,
    label: segment.name,
  })) || [];

  // --- HANDLERS ---

  const onProjectChange = (value: string) => {
    setFilters({ 
        projectId: value === "all" ? null : value,
        segmentId: null // ⚡ Project change hone par segment reset karein
    });
  };

  const onSegmentChange = (value: string) => {
    setFilters({ segmentId: value === "all" ? null : value });
  };

  const onDateChange = (date: Date | undefined) => {
    setFilters({ date: date ? date : null });
  };

  const resetFilters = () => {
    setFilters({ projectId: null, segmentId: null, date: null });
  };

  const isAnyFilterActive = !!projectId || !!segmentId || !!date;

  if (isLoadingProjects) return null; 

  return (
    <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center">
      
      {/* --- PROJECT FILTER --- */}
      <Select
        value={projectId || "all"}
        onValueChange={onProjectChange}
      >
        <SelectTrigger className="w-full lg:w-[180px] h-8 bg-white">
          <div className="flex items-center pr-2 truncate">
            <FolderIcon className="size-4 mr-2 text-muted-foreground shrink-0" />
            <SelectValue placeholder="All Projects" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          <SelectSeparator />
          {projectOptions.map((project) => (
            <SelectItem key={project.value} value={project.value}>
              {project.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* --- SEGMENT FILTER (New) --- */}
      <Select
        value={segmentId || "all"}
        onValueChange={onSegmentChange}
        disabled={!projectId} // ⚡ Agar Project select nahi hai to disable rahega
      >
        <SelectTrigger className="w-full lg:w-[180px] h-8 bg-white disabled:opacity-50 disabled:cursor-not-allowed">
          <div className="flex items-center pr-2 truncate">
            <Layers className="size-4 mr-2 text-muted-foreground shrink-0" />
            <SelectValue placeholder="All Segments" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Segments</SelectItem>
          <SelectSeparator />
          {segmentOptions.length > 0 ? (
              segmentOptions.map((segment) => (
                <SelectItem key={segment.value} value={segment.value}>
                  {segment.label}
                </SelectItem>
              ))
          ) : (
              <div className="p-2 text-xs text-muted-foreground text-center">
                  No segments found
              </div>
          )}
        </SelectContent>
      </Select>

      {/* --- DATE FILTER --- */}
      <div className="h-8 w-full lg:w-auto">
          <DatePicker
            placeholder="Filter by Date"
            className="h-8 w-full lg:w-[180px] bg-white"
            value={date || undefined}
            onChange={onDateChange}
          />
      </div>

      {/* --- RESET BUTTON --- */}
      {isAnyFilterActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4 mr-2" />
          Reset
        </Button>
      )}
    </div>
  );
};