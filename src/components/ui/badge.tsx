"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { TaskType, TaskPriority } from "@/features/tasks/types";
import { SegmentStatus } from "@/features/segments/types"; 
import { ProjectStatus } from "@/features/projects/types"; 
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
  Crown,      
  Briefcase,  
  User,       
} from "lucide-react";

// 1) Shared Status Type
type SharedStatus = "ACTIVE" | "ON_HOLD" | "COMPLETED" | "OVER_DUE";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | TaskType
  | TaskPriority
  | MemberRole
  | SharedStatus;

const variantLabels: Record<string, string> = {

  [TaskPriority.LOW]: "Low",
  [TaskPriority.MEDIUM]: "Medium",
  [TaskPriority.HIGH]: "High",

  [TaskType.TASK]: "Task",
  [TaskType.FEATURE]: "Feature",
  [TaskType.DOCUMENTATION]: "Docs",

  [MemberRole.ADMIN]: "Admin",
  [MemberRole.PROJECT_MANAGER]: "Manager",
  [MemberRole.MEMBER]: "Member",

  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  OVER_DUE: "Overdue",
};

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
       destructive:
          "border-transparent bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100/80 dark:hover:bg-rose-500/20",
        outline: "text-foreground",

        [TaskType.TASK]:
          "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100/80 dark:hover:bg-blue-500/20",
        [TaskType.FEATURE]:
          "border-transparent bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100/80 dark:hover:bg-green-500/20",
        [TaskType.DOCUMENTATION]:
          "border-transparent bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-100/80 dark:hover:bg-purple-500/20",

        [TaskPriority.LOW]:
          "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-500/20",
        [TaskPriority.MEDIUM]:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100/80 dark:hover:bg-amber-500/20",
        [TaskPriority.HIGH]:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100/80 dark:hover:bg-red-500/20",

        [MemberRole.ADMIN]:
          "border-transparent bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-100/80 dark:hover:bg-purple-500/20",
        [MemberRole.PROJECT_MANAGER]:
          "border-transparent bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100/80 dark:hover:bg-indigo-500/20",
        [MemberRole.MEMBER]:
          "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-500/20",

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

  const content = children || variantLabels[v as string] || children;

  const getDefaultIcon = () => {
    if (!showIcon) return null;

    switch (v) {

      case TaskPriority.HIGH:
        return <Flag className="size-3" />;
      case TaskPriority.MEDIUM:
        return <Star className="size-3" />;

      case TaskType.FEATURE:
        return <Star className="size-3" />;
      case TaskType.DOCUMENTATION:
        return <FileText className="size-3" />;

      case MemberRole.ADMIN:
        return <Crown className="size-3" />;
      case MemberRole.PROJECT_MANAGER:
        return <Briefcase className="size-3" />;
      case MemberRole.MEMBER:
        return <User className="size-3" />;

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