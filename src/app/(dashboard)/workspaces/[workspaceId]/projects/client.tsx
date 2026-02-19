"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useGetDummyProjects } from "@/features/projects/api/use-get-dummy-projects";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PageLoader } from "@/components/page-loader";
import { ProjectCard } from "@/features/projects/components/project-card";
import { StatCard } from "@/components/stats-cards";

import {
  Plus,
  Search,
  Filter,
  ListTodo,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  List,
  Grid,
} from "lucide-react";

interface ProjectsClientProps {
  workspaceId: string;
}

export const ProjectsClient = ({ workspaceId }: ProjectsClientProps) => {
  const { data: projectsData, isLoading } = useGetDummyProjects(workspaceId);
  const { open } = useCreateProjectModal();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const stats = useMemo(() => {
    const projs = projectsData?.documents || [];
    return {
      total: projs.length,
      completed: projs.filter((p) => p.projectStatus === "COMPLETED").length,
      active: projs.filter((p) => p.projectStatus === "ACTIVE").length,
      onHold: projs.filter((p) => p.projectStatus === "ON_HOLD").length,
      overdue: projs.filter((p) => p.projectStatus === "OVER_DUE").length,
    };
  }, [projectsData?.documents]);

  const filteredProjects = useMemo(() => {
    const projs = projectsData?.documents || [];
    return projs.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        project.projectStatus?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [projectsData?.documents, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
         <PageLoader />
      </div>
    );
  }

  const hasProjects = (projectsData?.documents?.length || 0) > 0;

  return (
    <>
      {!hasProjects ? (
        <Card className="bg-white border shadow-sm m-6">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-20 w-20 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <ListTodo className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No projects yet
              </h3>
              <p className="text-slate-500 mb-8">
                Create your first project to get started with project management
              </p>
              <Button
                onClick={open}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 shadow-md text-white transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-3 shadow-sm rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row gap-2 flex-1 overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
              <StatCard icon={ListTodo} label="Total Projects" value={stats.total} color="blue" />
              <StatCard icon={ListTodo} label="Active" value={stats.active} color="amber" />
              <StatCard icon={PauseCircle} label="On Hold" value={stats.onHold} color="orange" />
              <StatCard icon={AlertCircle} label="Overdue" value={stats.overdue} color="red" />
              <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="green" />
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
              <Button onClick={open} size="sm" className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-3">
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search projects..."
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
                        Status:{" "}
                        <span className="font-semibold ml-1 text-slate-700">
                            {statusFilter === "all" ? "All" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                      {["all", "active", "completed", "on-hold", "overdue"].map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className="cursor-pointer font-medium text-slate-700"
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>

            {view === "list" ? (
              <CardContent className="p-3 space-y-2 bg-slate-50/50 border-t border-slate-100">
                {filteredProjects.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-medium">No projects match your search.</div>
                ) : (
                  filteredProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/workspaces/${workspaceId}/projects/${project.id}`} 
                      className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                    >
                      <ProjectCard project={project} view={view} />
                    </Link>
                  ))
                )}
              </CardContent>
            ) : (
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 bg-slate-50/50 border-t border-slate-100">
                {filteredProjects.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-slate-500 font-medium">No projects match your search.</div>
                ) : (
                  filteredProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/workspaces/${workspaceId}/projects/${project.id}`}
                      className="block h-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl"
                    >
                      <ProjectCard project={project} view={view} />
                    </Link>
                  ))
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}

      <CreateProjectModal />
    </>
  );
};