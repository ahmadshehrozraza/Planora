"use client";

import { ArrowUpDown, MoreVertical } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { DateIndicator } from "../../../components/date-indicator";
import { Badge } from "@/components/ui/badge";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { TaskActions } from "./task-actions";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-2 p-0 hover:bg-transparent"
        >
          Task Name
          <ArrowUpDown className=" h-4 w-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.original.name;
      return (
          <p className="font-medium line-clamp-1 truncate w-[130px]">{name}</p>
      )
    }
  },
  {
    accessorFn: (row) => row.project?.name,
    id: "project",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Project
          <ArrowUpDown className=" h-4 w-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const project = row.original.project;
      const projectName = project?.name || "Unknown";

      return (
        <div className="flex items-center gap-x-2 w-[120px]">
          <ProjectAvatar
            className="size-6"
            fallbackClassName="text-md"
            name={projectName}
            image={project?.imageUrl}
          />
          <span className="text-sm font-medium truncate ">
            {projectName}
          </span>
        </div>
      )
    }
  },
  {
    accessorFn: (row) => row.segment?.name,
    id: "segment",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Segment
          <ArrowUpDown className=" h-4 w-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const segmentName = row.original.segment?.name || "No Segment";
      return (
        <p className="text-sm font-medium truncate w-[100px]">
          {segmentName}
        </p>
      )
    }
  },
  {
    accessorFn: (row) => row.assignee?.name,
    id: "assignee",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Assignee
          <ArrowUpDown className=" h-4 w-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const assigneeName = row.original.assignee?.name || "Unassigned";
      const assigneeImage = row.original.assignee?.image;

      return (
        <div className="flex items-center gap-x-2 w-[130px]">
          <MemberAvatar
            className="size-6"
            name={assigneeName}
            src={assigneeImage} 
          />
          <span className="text-sm font-medium truncate">
            {assigneeName}
          </span>
        </div>
      )
    }
  },
  {
    accessorFn: (row) => row.column?.name,
    id: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Status
          <ArrowUpDown className=" h-4 w-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const statusName = row.original.column?.name || "Unknown";

      return (
        <div className="w-[100px] flex items-center">
          <Badge variant="default">{statusName}</Badge>
        </div>
      )
    }
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="p-0 hover:bg-transparent"
      >
        Priority
        <ArrowUpDown className="h-4 w-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const priority = row.original.priority;
      return (
        <div className="w-[100px] flex items-center">
          <Badge variant={priority}>
            {snakeCaseToTitleCase(priority)}
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Due Date
          <ArrowUpDown className=" h-4 w-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;
      return (
        <div className="w-[100px] flex items-center">
          <DateIndicator value={dueDate} />
        </div>
      )
    }
  },
   {
    accessorKey: "progress",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Progress
          <ArrowUpDown className=" h-4 w-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const progress = row.original.progress;
      return (
        <div className="w-[100px] flex items-center">
          {progress}
        </div>
      )
    }
  },
  {
    accessorFn: (row) => row.blockedBy?.name,
    id: "blockedBy",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Blocked By
          <ArrowUpDown className=" h-4 w-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const blockedBy = row.original.blockedBy?.name || "-";
      return (
        <div className="flex items-center w-[120px] truncate">
          {blockedBy}
        </div>
      )
    }
  },
  {
    accessorFn: (row) => row.blocking?.length ? row.blocking.map((t:any) => t.name).join(", ") : "-",
    id: "blockingTo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Blocking
          <ArrowUpDown className=" h-4 w-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const blockingList = row.original.blocking;
      const display = blockingList?.length > 0 ? blockingList.map((t:any) => t.name).join(", ") : "-";
      return (
        <div className="flex items-center w-[120px] truncate" title={display}>
          {display}
        </div>
      )
    }
  },
  {
    accessorKey: "effortPoints",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Points
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const effortPoints = row.original.effortPoints || 1;
      return (
        <div className="w-[60px] flex items-center">
          <Badge variant="outline">{effortPoints}</Badge>
        </div>
      )
    }
  },
{
    id: "actions",
    header: () => <div className="w-0" />,
    cell: ({ row }) => {
      const id = row.original.id;
      const projectId = row.original.projectId;
      
      const assigneeId = row.original.assigneeId || row.original.assignee?.id;
      const assigneeEmail = row.original.assignee?.email;

      return (
        <TaskActions 
            id={id} 
            projectId={projectId}
            assigneeId={assigneeId}
            assigneeEmail={assigneeEmail}
        >
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </TaskActions>
      )
    }
  }
];