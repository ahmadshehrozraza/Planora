"use client";

import { ArrowUpDown, MoreVertical } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { TaskDate } from "./task-date";
import { Badge } from "@/components/ui/badge";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { TaskActions } from "./task-actions";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { dummyProjects } from "@/features/projects/dummyProjects";
import { dummyUsers } from "@/features/auth/server/dummy-users";
import { dummySegments } from "@/features/segments/hooks/dummy-segments";

// Helper functions
const getProjectName = (projectId: string) => {
  const project = dummyProjects.find(p => p.id === projectId);
  return project?.name || projectId;
};

const getUserName = (userId: string) => {
  const user = dummyUsers.find(u => u.userId === userId);
  return user?.name || userId;
};

const getSegmentName = (segmentId: string) => {
  if (!segmentId) return "";
  const segment = dummySegments.find(s => s.id === segmentId);
  return segment?.name || "";
};

export const columns: ColumnDef<Task>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
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
          <ArrowUpDown className=" h-4 w-4" />
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
    accessorKey: "project",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-9 p-0 hover:bg-transparent"
        >
          Project
          <ArrowUpDown className=" h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const projectId = row.original.projectId;
      const projectName = getProjectName(projectId);

      return (
        <div className="flex items-center gap-x-1 ml-5  w-[120px]">
          <ProjectAvatar
            className="size-6"
            fallbackClassName="text-md"
            name={projectName}
            image={null}
          />
          <span className="text-sm font-medium truncate ">
            {projectName}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: "segment",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-8 p-0 hover:bg-transparent"
        >
          Segment
          <ArrowUpDown className=" h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const segmentId = row.original.segmentId;
      const segmentName = getSegmentName(segmentId);

      return (
        <p className="text-sm ml-8 font-medium truncate w-[100px]">
          {segmentName}
        </p>
      )
    }
  },
  {
    accessorKey: "assignee",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-14 p-0 hover:bg-transparent"
        >
          Assignee
          <ArrowUpDown className=" h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const assigneeId = row.original.assigneeId;
      const assigneeName = getUserName(assigneeId);

      return (
        <div className="flex items-center gap-x-2 ml-8 w-[130px]">
          <div className="w-auto">
            <MemberAvatar
              className="size-6"
              name={assigneeName}
            />
          </div>

          <span className="text-sm font-medium truncate">
            {assigneeName || "No Assignee"}
          </span>
        </div>
      )

    }
  },
  {
    accessorKey: "blockedBy",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-14 p-0 hover:bg-transparent"
        >
          Blocked By
          <ArrowUpDown className=" h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const blockedBy = row.original.blockedBy;
      return (
        <div className="flex items-center gap-x-2 ml-16">
          {blockedBy}
        </div>
      )

    }
  },
   {
    accessorKey: "blockingTo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-14 p-0 hover:bg-transparent"
        >
          Blocking To
          <ArrowUpDown className=" h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const blockingTo = row.original.blockingTo;
      return (
        <div className="flex items-center gap-x-2 ml-16">
          {blockingTo}
        </div>
      )

    }
  },
    {
    accessorKey: "effortPoints",
    header: ({ column }) => {
      return (
        <div className=" w-[100px]">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="ml-12 hover:bg-transparent"
          >
            Effort Points
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const effortPoints = row.original.effortPoints;

      return (
        <div className="ml-20 w-[60px] flex justify-center items-center">
          {<Badge variant="outline">{effortPoints} / 10</Badge>}
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
          className="ml-20 p-0 hover:bg-transparent"
        >
          Due Date
          <ArrowUpDown className=" h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dueDate = row.original.endDate;
      return (
        <div className=" w-[100px] ml-16 flex items-center justify-center">
          <TaskDate value={dueDate} />
        </div>
      )
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-24 p-0 hover:bg-transparent"
        >
          Status
          <ArrowUpDown className=" h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.original.taskStatus;
      return (
        <div className="ml-20 w-[100px] flex justify-center items-center">
          <Badge variant={status}>{snakeCaseToTitleCase(status)}</Badge>
        </div>
      )
    }
  },
  {
  accessorKey: "priority",
  header: ({ column }) => (
    <div className="ml-20 w-[100px]">
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent justify-end"
      >
        Priority
        <ArrowUpDown className="h-4 w-4 ml-2" />
      </Button>
    </div>
  ),
  cell: ({ row }) => {
    const priority = row.original.taskPriority;
    return (
      <div className="ml-[90px] w-[100px] flex justify-center items-center">
        <Badge variant={priority}>
          {snakeCaseToTitleCase(priority)}
        </Badge>
      </div>
    )
  }
  },
  {
    accessorKey: "progress",
    header: ({ column }) => {
      return (
        <div className=" w-[100px]">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="ml-20 hover:bg-transparent"
          >
            Progress
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const progress = row.original.progress;

      return (
        <div className="ml-[108px] w-[60px] flex justify-center items-center">
          {<Badge variant="outline">{progress}%</Badge>}
        </div>
      )
    }
  },
  {
    id: "actions",
    header: ({ column }) => {
      return(
      <div className="bg-gray-300 w-0" />
      )
    },
    cell: ({ row }) => {
      const id = row.original.id;
      const projectId = row.original.projectId;

      return (
        <div className="">
        <TaskActions id={id} projectId={projectId}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </TaskActions>
      </div>
      )
    }
  }
];