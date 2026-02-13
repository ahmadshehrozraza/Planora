"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  labelPosition?: "top" | "bottom";
  size?: "sm" | "md" | "lg";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  className = "",
  showLabel = true,
  labelPosition = "bottom",
  size = "md"
}) => {
  const heightClass = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  }[size];

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && labelPosition === "top" && (
        <span className="text-xs text-muted-foreground">{value}% complete</span>
      )}
      
      <Progress 
        value={value} 
        className={cn("w-full", heightClass)} 
      />
      
      {showLabel && labelPosition === "bottom" && (
        <span className="text-xs text-muted-foreground flex justify-end">{value}% complete</span>
      )}
    </div>
  );
};