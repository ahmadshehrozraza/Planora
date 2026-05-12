"use client";

import { FolderIcon, X } from "lucide-react";
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
import { format, parseISO } from "date-fns";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useEventFilters } from "../hooks/use-event-filters";
import { useGetProjects } from "@/features/projects/api/use-get-projects";

export const EventFilters = () => {
  const workspaceId = useWorkspaceId();
  
  const [{ projectId, date }, setFilters] = useEventFilters();

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });

  const projectOptions = projects?.map((project) => ({
    value: project.id,
    label: project.name,
  })) || [];

  const onProjectChange = (value: string) => {
    setFilters({ 
      projectId: value === "all" ? null : value,
    });
  };

  const onDateChange = (newDate: Date | undefined) => {
    setFilters({ date: newDate ? format(newDate, "yyyy-MM-dd") : null });
  };

  const resetFilters = () => {
    setFilters({ projectId: null, date: null });
  };

  const isAnyFilterActive = !!projectId || !!date;

  if (isLoadingProjects) return null; 

  return (
    <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center">
      
      <Select value={projectId || "all"} onValueChange={onProjectChange}>
        <SelectTrigger className="w-full lg:w-[180px] h-8 bg-background border-border">
          <div className="flex items-center pr-2 truncate">
            <FolderIcon className="size-4 mr-2 text-muted-foreground shrink-0" />
            <SelectValue placeholder="All Projects" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all" className="cursor-pointer focus:bg-accent focus:text-accent-foreground">All Projects</SelectItem>
          {projectOptions.length > 0 && <SelectSeparator className="bg-border" />}
          {projectOptions.map((project) => (
            <SelectItem key={project.value} value={project.value} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
              {project.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="h-8 w-full lg:w-auto">
          <DatePicker
            placeholder="Filter by Date"
            className="h-8 w-full lg:w-[180px] bg-background border-border"
            value={date ? parseISO(date) : undefined}
            onChange={onDateChange}
          />
      </div>

      {isAnyFilterActive && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-accent">
          <X className="size-4 mr-2" />
          Reset
        </Button>
      )}
    </div>
  );
};