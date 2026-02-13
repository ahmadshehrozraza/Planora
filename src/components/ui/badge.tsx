"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { TaskStatus, TaskType, TaskPriority } from "@/features/tasks/types";
import { SegmentStatus } from "@/features/segments/types"; // Assuming needed
import { ProjectStatus } from "@/features/projects/types"; // Assuming needed
import { MemberRole } from "@/features/members/types";

import {
  CheckCircle,
  Clock,
  Eye,
  CircleDashed,
  ListTodo,
  Flag,
  FileText,
  Star,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Crown,      // Icon for Admin
  Briefcase,  // Icon for Project Manager
  User,       // Icon for Member
} from "lucide-react";

// 1) Shared Status Type
type SharedStatus = "ACTIVE" | "ON_HOLD" | "COMPLETED" | "OVER_DUE";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | TaskStatus
  | TaskType
  | TaskPriority
  | MemberRole
  | SharedStatus;

// 2) Mapping for Automatic Labels
const variantLabels: Record<string, string> = {
  // Task Status
  [TaskStatus.TODO]: "To Do",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.IN_REVIEW]: "In Review",
  [TaskStatus.DONE]: "Done",
  [TaskStatus.BACKLOG]: "Backlog",

  // Task Priority
  [TaskPriority.LOW]: "Low",
  [TaskPriority.MEDIUM]: "Medium",
  [TaskPriority.HIGH]: "High",

  // Task Type
  [TaskType.TASK]: "Task",
  [TaskType.FEATURE]: "Feature",
  [TaskType.DOCUMENTATION]: "Docs",

  // Member Roles
  [MemberRole.ADMIN]: "Admin",
  [MemberRole.PROJECT_MANAGER]: "Manager",
  [MemberRole.MEMBER]: "Member",

  // Shared Status
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  OVER_DUE: "Overdue",
};

// 3) Styles
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        // Base variants
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",

        // Task Status Colors
        [TaskStatus.TODO]:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100/80 dark:hover:bg-red-500/20",
        [TaskStatus.IN_PROGRESS]:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100/80 dark:hover:bg-amber-500/20",
        [TaskStatus.IN_REVIEW]:
          "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100/80 dark:hover:bg-blue-500/20",
        [TaskStatus.DONE]:
          "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/80 dark:hover:bg-emerald-500/20",
        [TaskStatus.BACKLOG]:
          "border-transparent bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400 border-pink-200 dark:border-pink-800 hover:bg-pink-100/80 dark:hover:bg-pink-500/20",

        // Task Type Colors
        [TaskType.TASK]:
          "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100/80 dark:hover:bg-blue-500/20",
        [TaskType.FEATURE]:
          "border-transparent bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100/80 dark:hover:bg-green-500/20",
        [TaskType.DOCUMENTATION]:
          "border-transparent bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-100/80 dark:hover:bg-purple-500/20",

        // Task Priority Colors
        [TaskPriority.LOW]:
          "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-500/20",
        [TaskPriority.MEDIUM]:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100/80 dark:hover:bg-amber-500/20",
        [TaskPriority.HIGH]:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100/80 dark:hover:bg-red-500/20",

        // Member Roles Colors (Purple, Indigo, Slate)
        [MemberRole.ADMIN]:
          "border-transparent bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-100/80 dark:hover:bg-purple-500/20",
        [MemberRole.PROJECT_MANAGER]:
          "border-transparent bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100/80 dark:hover:bg-indigo-500/20",
        [MemberRole.MEMBER]:
          "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-500/20",

        // Shared status Colors
        ACTIVE:
          "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/80 dark:hover:bg-emerald-500/20",
        ON_HOLD:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100/80 dark:hover:bg-amber-500/20",
        COMPLETED:
          "border-transparent bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100/80 dark:hover:bg-green-500/20",
        OVER_DUE:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100/80 dark:hover:bg-red-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  showIcon?: boolean;
}

function normalizeVariant(v?: BadgeVariant): BadgeVariant {
  if (!v) return "default";
  return v;
}

function Badge({
  className,
  variant = "default",
  icon,
  showIcon = true,
  children,
  ...props
}: BadgeProps) {
  const v = normalizeVariant(variant);

  // 4) Logic to determine content (Children > Mapped Label > Raw Variant)

  const content = children || variantLabels[v as string] || children;

  const getDefaultIcon = () => {
    if (!showIcon) return null;

    switch (v) {
      // Task Status
      case TaskStatus.DONE:
        return <CheckCircle className="size-3" />;
      case TaskStatus.IN_PROGRESS:
        return <Clock className="size-3" />;
      case TaskStatus.IN_REVIEW:
        return <Eye className="size-3" />;
      case TaskStatus.TODO:
        return <CircleDashed className="size-3" />;
      case TaskStatus.BACKLOG:
        return <ListTodo className="size-3" />;

      // Task Priority
      case TaskPriority.HIGH:
        return <Flag className="size-3" />;
      case TaskPriority.MEDIUM:
        return <Star className="size-3" />;

      // Task Type
      case TaskType.FEATURE:
        return <Star className="size-3" />;
      case TaskType.DOCUMENTATION:
        return <FileText className="size-3" />;

      // Member Roles
      case MemberRole.ADMIN:
        return <Crown className="size-3" />;
      case MemberRole.PROJECT_MANAGER:
        return <Briefcase className="size-3" />;
      case MemberRole.MEMBER:
        return <User className="size-3" />;

      // Shared statuses
      case "ACTIVE":
        return <PlayCircle className="size-3" />;
      case "ON_HOLD":
        return <PauseCircle className="size-3" />;
      case "COMPLETED":
        return <CheckCircle className="size-3" />;
      case "OVER_DUE":
        return <AlertCircle className="size-3" />;

      default:
        return null;
    }
  };

  const displayIcon = icon || getDefaultIcon();

  return (
    <div className={cn(badgeVariants({ variant: v }), className)} {...props}>
      {displayIcon}

      <span>{content}</span>
    </div>
  );
}

export { Badge, badgeVariants };