"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Task, TaskStatus, TaskType, TaskPriority } from "../types";
import { format } from "date-fns";
import { dummyUsers } from "@/features/auth/server/dummy-users";
import { dummyProjects } from "@/features/projects/dummyProjects";
import { dummySegments } from "@/features/segments/hooks/dummy-segments";

// Helper functions
const getUserName = (userId: string) => {
  const user = dummyUsers.find(u => u.userId === userId);
  return user?.name || `User ${userId}`;
};

const getProjectName = (projectId: string) => {
  const project = dummyProjects.find(p => p.id === projectId);
  return project?.name || `Project ${projectId}`;
};

const getSegmentName = (segmentId: string) => {
  const segment = dummySegments.find(s => s.id === segmentId);
  return segment?.name || "";
};

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.DONE:
      return "bg-green-100 text-green-800 border-green-200";
    case TaskStatus.IN_PROGRESS:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case TaskStatus.IN_REVIEW:
      return "bg-purple-100 text-purple-800 border-purple-200";
    case TaskStatus.TODO:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case TaskStatus.BACKLOG:
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.HIGH:
      return "bg-red-100 text-red-800 border-red-200";
    case TaskPriority.MEDIUM:
      return "bg-orange-100 text-orange-800 border-orange-200";
    case TaskPriority.LOW:
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getTypeColor = (type: TaskType) => {
  switch (type) {
    case TaskType.FEATURE:
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case TaskType.DOCUMENTATION:
      return "bg-pink-100 text-pink-800 border-pink-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
};

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Task Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const task = row.original;
      return (
        <div className="flex flex-col space-y-1">
          <div className="font-medium">{task.name}</div>
          {task.description && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {task.description}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "project",
    header: "Project",
    cell: ({ row }) => {
      const projectName = getProjectName(row.original.projectId);
      return (
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {projectName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{projectName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "segment",
    header: "Segment",
    cell: ({ row }) => {
      const segmentName = getSegmentName(row.original.segmentId);
      return segmentName ? (
        <Badge variant="outline" className="text-xs">
          {segmentName}
        </Badge>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
    cell: ({ row }) => {
      const assigneeName = getUserName(row.original.assigneeId);
      return row.original.assigneeId ? (
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
              {assigneeName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{assigneeName}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Unassigned</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.taskStatus;
      return (
        <Badge className={`${getStatusColor(status)} text-xs font-medium`}>
          {status.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.taskPriority;
      return (
        <Badge className={`${getPriorityColor(priority)} text-xs font-medium`}>
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.taskType;
      return (
        <Badge className={`${getTypeColor(type)} text-xs font-medium`}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const progress = row.original.progress;
      return (
        <div className="flex items-center space-x-2">
          <Progress value={progress} className="h-2 w-20" />
          <span className="text-sm font-medium">{progress}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: "effortPoints",
    header: "Effort",
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
            {row.original.effortPoints}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "budget",
    header: "Budget",
    cell: ({ row }) => {
      const budget = row.original.budget;
      return budget > 0 ? (
        <div className="text-sm font-medium">
          ${budget.toLocaleString()}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const dueDate = row.original.endDate;
      const isOverdue = dueDate < new Date() && row.original.taskStatus !== TaskStatus.DONE;
      
      return (
        <div className="text-sm">
          <div className={isOverdue ? "text-red-600 font-medium" : ""}>
            {format(dueDate, "MMM dd, yyyy")}
          </div>
          {isOverdue && (
            <div className="text-xs text-red-500">Overdue</div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(task.id)}
            >
              Copy task ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit task</DropdownMenuItem>
            <DropdownMenuItem>Change status</DropdownMenuItem>
            <DropdownMenuItem>Reassign</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];