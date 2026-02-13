
"use client";

import { useState } from "react";
import Link from "next/link";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
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

export default function ProjectsPage() {
  const workspaceId = useWorkspaceId();
  const { data: projectsData, isLoading } = useGetDummyProjects(workspaceId);
  const { open } = useCreateProjectModal();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  if (isLoading) {
    return (
      <PageLoader />
    )
  }

  const projects = projectsData?.documents || [];
  const hasProjects = projects.length > 0;

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      searchQuery === "" ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      project.projectStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (p) => p.projectStatus === "COMPLETED"
  ).length;
  const activeProjects = projects.filter(
    (p) => p.projectStatus === "ACTIVE"
  ).length;
  const onHoldProjects = projects.filter(
    (p) => p.projectStatus === "ON_HOLD"
  ).length;
  const overdueProjects = projects.filter(
    (p) => p.projectStatus === "OVER_DUE"
  ).length;

  return (
    <div className="w-full bg-gray-50/50">
      <div className="mx-auto">
        {!hasProjects ? (
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="h-20 w-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <ListTodo className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-500 mb-8">
                  Create your first project to get started with project management
                </p>
                <Button
                  onClick={open}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 items-center justify-between bg-white p-2 mb-4 shadow-sm rounded-lg border">
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <StatCard
                  icon={ListTodo}
                  label="Total Projects"
                  value={totalProjects}
                  color="blue"
                />
                <StatCard
                  icon={ListTodo}
                  label="Active"
                  value={activeProjects}
                  color="amber"
                />
                <StatCard
                  icon={PauseCircle}
                  label="On Hold"
                  value={onHoldProjects}
                  color="orange"
                />
                <StatCard
                  icon={AlertCircle}
                  label="Overdue"
                  value={overdueProjects}
                  color="red"
                />
                <StatCard
                  icon={CheckCircle}
                  label="Completed"
                  value={completedProjects}
                  color="green"
                />
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={open}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Project
                </Button>
              </div>
            </div>

            <Card className="bg-white border shadow-sm mb-3">
              <CardContent className="p-3 rounded-none">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                  <div className="flex gap-2">
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
                  </div>
                  <div className="w-full md:w-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-11 w-full md:w-auto">
                          <Filter className="h-4 w-4 mr-2" />
                          Status:{" "}
                          {statusFilter === "all"
                            ? "All"
                            : statusFilter.charAt(0).toUpperCase() +
                            statusFilter.slice(1)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {["all", "active", "completed", "on-hold", "overdue"].map(
                          (status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => setStatusFilter(status)}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)} Projects
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>

              {view === "list" ? (

              <CardContent className="p-3 space-y-2">
                {filteredProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`projects/${project.id}`}
                    className="block"
                  >
                    <ProjectCard 
                      project={project}
                      view={view}
                      />
                  </Link>
                ))}
              </CardContent>

              ) : (
                
                <CardContent className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border-none">
                {filteredProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/workspaces/${workspaceId}/projects/${project.id}`}
                    className="block"
                  >
                    <ProjectCard 
                      project={project}
                      view={view}
                      />
                  </Link>
                ))}
              </CardContent>

                )}
            </Card>
          </>
        )}
      </div>

      <CreateProjectModal />
    </div>
  );
}
