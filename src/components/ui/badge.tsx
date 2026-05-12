"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { TaskType, TaskPriority } from "@/features/tasks/types";
import { SprintStatus } from "@/features/sprints/types"; 
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
  Bug,
  TestTube,
  Tag,
  Circle
} from "lucide-react";

type SharedStatus = "PLANNED" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CLOSED" | "CANCELLED";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | TaskType
  | TaskPriority
  | MemberRole
  | SharedStatus
  | "custom-tag"; 

const variantLabels: Record<string, string> = {

  [TaskPriority.LOW]: "Low",
  [TaskPriority.MEDIUM]: "Medium",
  [TaskPriority.HIGH]: "High",
  [TaskPriority.URGENT]: "Urgent",

  [TaskType.FEATURE]: "Feature",
  [TaskType.TASK]: "Task",
  [TaskType.BUG]: "Bug",
  [TaskType.SPIKE]: "Spike",
  [TaskType.DOCS]: "Docs",

  [MemberRole.ADMIN]: "Admin",
  [MemberRole.PROJECT_MANAGER]: "Manager",
  [MemberRole.MEMBER]: "Member",

  PLANNED: "Planned",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
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

        "custom-tag": "border shadow-sm bg-transparent",

        [TaskType.FEATURE]:
          "border-transparent bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100/80 dark:hover:bg-green-500/20",
        [TaskType.TASK]:
          "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100/80 dark:hover:bg-blue-500/20",
        [TaskType.BUG]:
          "border-transparent bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100/80 dark:hover:bg-rose-500/20",
        [TaskType.SPIKE]:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100/80 dark:hover:bg-amber-500/20",
        [TaskType.DOCS]:
          "border-transparent bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-100/80 dark:hover:bg-purple-500/20",

        [TaskPriority.LOW]:
          "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-500/20",
        [TaskPriority.MEDIUM]:
          "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100/80 dark:hover:bg-blue-500/20",
        [TaskPriority.HIGH]:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100/80 dark:hover:bg-amber-500/20",
        [TaskPriority.URGENT]:
          "border-transparent bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100/80 dark:hover:bg-rose-500/20",

        [MemberRole.ADMIN]:
          "border-transparent bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-100/80 dark:hover:bg-purple-500/20",
        [MemberRole.PROJECT_MANAGER]:
          "border-transparent bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100/80 dark:hover:bg-indigo-500/20",
        [MemberRole.MEMBER]:
          "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-500/20",

        PLANNED:
          "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-500/20",
        ACTIVE:
          "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100/80 dark:hover:bg-blue-500/20",
        ON_HOLD:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100/80 dark:hover:bg-amber-500/20",
        COMPLETED:
          "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/80 dark:hover:bg-emerald-500/20",
        CLOSED:
          "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/80 dark:hover:bg-emerald-500/20",
        CANCELLED:
          "border-transparent bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100/80 dark:hover:bg-rose-500/20",
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
  tagColor?: string; 
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
  tagColor,
  children,
  ...props
}: BadgeProps) {
  const v = normalizeVariant(variant);

  const content = children || variantLabels[v as string] || children;

  const getDefaultIcon = () => {
    if (!showIcon) return null;

    if (v === "custom-tag" && tagColor) {
      return (
        <span 
          className="size-2 rounded-full mr-0.5" 
          style={{ backgroundColor: tagColor }} 
        />
      );
    }

    switch (v) {

      case TaskPriority.URGENT:
        return <AlertCircle className="size-3" />;
      case TaskPriority.HIGH:
        return <Flag className="size-3" />;
      case TaskPriority.MEDIUM:
      case TaskPriority.LOW:
        return null; 

      case TaskType.FEATURE:
        return <Star className="size-3" />;
      case TaskType.BUG:
        return <Bug className="size-3" />;
      case TaskType.SPIKE:
        return <TestTube className="size-3" />;
      case TaskType.DOCS:
        return <FileText className="size-3" />;
      case TaskType.TASK:
        return <ListTodo className="size-3" />;

      case MemberRole.ADMIN:
        return <Crown className="size-3" />;
      case MemberRole.PROJECT_MANAGER:
        return <Briefcase className="size-3" />;
      case MemberRole.MEMBER:
        return <User className="size-3" />;

      case "PLANNED":
        return <Clock className="size-3" />;
      case "ACTIVE":
        return <PlayCircle className="size-3" />;
      case "ON_HOLD":
        return <PauseCircle className="size-3" />;
      case "COMPLETED":
      case "CLOSED":
        return <CheckCircle className="size-3" />;
      case "CANCELLED":
        return <CircleDashed className="size-3" />;

      default:
        return null;
    }
  };

  const displayIcon = icon || getDefaultIcon();

  const customTagStyle = v === "custom-tag" && tagColor ? {
    backgroundColor: `${tagColor}15`, 
    borderColor: `${tagColor}40`,
    color: 'inherit' 
  } : {};

  return (
    <div 
      className={cn(badgeVariants({ variant: v }), className)} 
      style={customTagStyle}
      {...props}
    >
      {displayIcon}
      <span>{content}</span>
    </div>
  );
}

export { Badge, badgeVariants };