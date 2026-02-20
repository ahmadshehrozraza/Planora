"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statCardVariants = cva(
  "flex items-center justify-between border shadow-sm transition-colors",
  {
    variants: {
      variant: {
        default: "bg-background border-border",
        primary: "bg-blue-50/50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20",
        success: "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20",
        warning: "bg-amber-50/50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20",
        destructive: "bg-rose-50/50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20",
        muted: "bg-slate-50/50 border-slate-100 dark:bg-slate-500/10 dark:border-slate-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconVariants = cva("h-5 w-5", {
  variants: {
    variant: {
      default: "text-muted-foreground",
      primary: "text-blue-600 dark:text-blue-400",
      success: "text-emerald-600 dark:text-emerald-400",
      warning: "text-amber-600 dark:text-amber-400",
      destructive: "text-rose-600 dark:text-rose-400",
      muted: "text-slate-600 dark:text-slate-400",
    },
  },
  defaultVariants: { variant: "default" },
});

const textVariants = cva("text-sm font-medium", {
  variants: {
    variant: {
      default: "text-muted-foreground",
      primary: "text-blue-700 dark:text-blue-300",
      success: "text-emerald-700 dark:text-emerald-300",
      warning: "text-amber-700 dark:text-amber-300",
      destructive: "text-rose-700 dark:text-rose-300",
      muted: "text-slate-700 dark:text-slate-300",
    },
  },
  defaultVariants: { variant: "default" },
});

const valueVariants = cva("text-xl font-bold", {
  variants: {
    variant: {
      default: "text-foreground",
      primary: "text-blue-900 dark:text-blue-100",
      success: "text-emerald-900 dark:text-emerald-100",
      warning: "text-amber-900 dark:text-amber-100",
      destructive: "text-rose-900 dark:text-rose-100",
      muted: "text-slate-900 dark:text-slate-100",
    },
  },
  defaultVariants: { variant: "default" },
});

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  variant?: "default" | "primary" | "success" | "warning" | "destructive" | "muted";
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  variant = "default",
  className 
}) => {
  return (
    <Card className={cn(statCardVariants({ variant }), "flex-1 min-w-[140px] rounded-xl", className)}>
      <CardContent className="p-3 w-full">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon className={iconVariants({ variant })} />
            <p className={textVariants({ variant })}>{label}</p>
          </div>
          <span className={valueVariants({ variant })}>{value}</span>
        </div>
      </CardContent>
    </Card>
  );
};