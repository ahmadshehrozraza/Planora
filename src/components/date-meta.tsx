"use client";

import * as React from "react";
import { format } from "date-fns";

interface DateMetaProps {
  startDate: Date;
  dueDate: Date;
  className?: string;
  showStartLabel?: boolean;
  showEndLabel?: boolean;
}

export const DateMeta: React.FC<DateMetaProps> = ({ 
  startDate, 
  dueDate, 
  className = "",
  showStartLabel = true,
  showEndLabel = true 
}) => {
  return (
    <div className={`flex gap-4 text-sm text-muted-foreground ${className}`}>
      {showStartLabel && (
        <span>Start: {format(startDate, "PPP")}</span>
      )}
      {showEndLabel && (
        <span>End: {format(dueDate, "PPP")}</span>
      )}
    </div>
  );
};