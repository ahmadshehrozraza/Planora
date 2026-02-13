"use client";

import * as React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, daysSinceStart, daysUntilDue, snakeCaseToTitleCase } from "@/lib/utils";
import { ProgressBar } from "@/components/Progress-bar";
import { LabelValue } from "@/components/label-value";
import { DummyProject, ProjectStatus } from "@/features/projects/types";
import { ProjectAvatar } from "./project-avatar";
import { TaskDate, dateFormatter } from "@/features/tasks/components/task-date";

interface ProjectCardProps {
  project: DummyProject;
  className?: string;
  view: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  className = "",
  view = "grid",
}) => {
  return (
    <div className={cn(

      className
    )}>

      {view === "grid" ? (

        <Card className="">
          <CardHeader className="border-none p-2 bg-zinc-100">
            <div className="flex items-center justify-between ">

              <div className="flex items-center min-w-0">
                <ProjectAvatar name={project.name} />
                <h2 className="ml-2.5 truncate font-semibold">{project.name}</h2>
              </div>


              <div className="flex-shrink-0">
                <Badge variant={project.projectStatus}>{snakeCaseToTitleCase(project.projectStatus)}</Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="border-none p-2 space-y-2">
            <div className="flex flex-col space-y-2 ">
              <div className="flex justify-between">
                <LabelValue label="Start Date" labelClassname="min-w-[70px]">
                    <Badge variant="outline">{dateFormatter(project.startDate)}</Badge>
                </LabelValue>
                <Badge variant="outline" >{daysSinceStart(project.startDate)}</Badge>
              </div>

              <div className="flex justify-between flex-wrap-reverse">
                <LabelValue
                  label="End Date" 
                  labelClassname="min-w-[70px]"
                >
                  <Badge variant="outline">{<TaskDate value={project.dueDate} />}</Badge>
                </LabelValue>

                {project.projectStatus === ProjectStatus.ACTIVE && (
                  <Badge variant="ACTIVE" showIcon={false}>
                    {daysUntilDue(project.dueDate)} days remains
                  </Badge>
                )}

                {project.projectStatus === ProjectStatus.OVER_DUE && (
                  <Badge variant="OVER_DUE" showIcon={false}>
                    {daysUntilDue(project.dueDate)} days overdue
                  </Badge>
                )}

                {project.projectStatus === ProjectStatus.COMPLETED && (
                  <Badge variant="COMPLETED" showIcon={false}>
                    {daysUntilDue(project.dueDate)} days ago
                  </Badge>
                )}
              </div>

            </div>

            <div className="flex flex-col space-y-2 ">
              <div className="flex justify-between">
                <LabelValue
                  label="Tasks"
                  labelClassname="min-w-[70px]"
                >
                  <Badge variant="outline">{`${5} / ${project.totalTasks}`}</Badge>
                </LabelValue>
              </div>

              <div className="flex justify-between">
                <LabelValue
                  label="Segments"
                  labelClassname="min-w-[70px]"
                >
                  <Badge variant="outline">{`${5} / ${project.totalSegments}`}</Badge>
                </LabelValue>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center p-3 justify-center">
            <ProgressBar value={project.progress} className="w-full text-lg" />
          </CardFooter>
        </Card>

      ) : (

        <Card>
          <CardHeader className="border-none p-2">
            <div className="flex justify-between ">

              <div className="flex min-w-0">
                <ProjectAvatar name={project.name} className="size-10" />
                <h2 className="ml-2.5 mt-1 truncate font-semibold">{project.name}</h2>
              </div>

              <div className="flex flex-col space-y-1">
              <div className="flex justify-between">
                <LabelValue
                  label="Start Date"
                  labelClassname="min-w-[70px]"
                >
                  <Badge variant="outline">{dateFormatter(project.startDate)}</Badge>
                </LabelValue>
                <Badge  variant="outline" >{daysSinceStart(project.startDate)}</Badge>
              </div>

              <div className="flex justify-between">
                <LabelValue
                  label="End Date"
                  labelClassname="min-w-[70px]"
                  chClassname=""
                >
                  <Badge variant="outline" >{<TaskDate value={project.dueDate}/>}</Badge>
                </LabelValue>

                {project.projectStatus === ProjectStatus.ACTIVE && (
                  <Badge variant="ACTIVE">
                    {daysUntilDue(project.dueDate)} days remaining
                  </Badge>
                )}

                {project.projectStatus === ProjectStatus.OVER_DUE && (
                  <Badge variant="OVER_DUE">
                    {daysUntilDue(project.dueDate)} days overdue
                  </Badge>
                )}

                {project.projectStatus === ProjectStatus.COMPLETED && (
                  <Badge variant="COMPLETED">
                    {daysUntilDue(project.dueDate)} days ago
                  </Badge>
                )}
              </div>

            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex justify-between">
                <LabelValue
                  label="Tasks"
                  labelClassname="min-w-[70px]"
                >
                  <Badge variant="outline">{`${5} / ${project.totalTasks}`}</Badge>
                </LabelValue>
              </div>

              <div className="flex justify-between">
                <LabelValue
                  label="Segments"
                  labelClassname="min-w-[70px]"
                  >
                  <Badge variant="outline">{`${3} / ${project.totalSegments}`}</Badge>
                </LabelValue>
              </div>
            </div>


              <div className="flex-shrink-0">
                <Badge variant={project.projectStatus}>{project.projectStatus}</Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="border-none p-2 space-y-2">
            

            
          </CardContent>

          <CardFooter className="flex items-center p-3 justify-center">
            <ProgressBar value={project.progress} className="w-full text-lg" />
          </CardFooter>
        </Card>
      )}

    </div>
  );
};