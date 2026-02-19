import { differenceInDays, format, isValid } from "date-fns"; 
import { cn } from "@/lib/utils";

export function dateFormatter(date: Date | string | null): string {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;

  if (!isValid(d)) {
    return "";
  }

  return format(d, "MMMM do, yyyy");
}

interface DateIndicatorProps {
  value: Date | string;
  className?: string;
}

export const DateIndicator = ({ value, className }: DateIndicatorProps) => {
  const endDate = new Date(value);

  if (!isValid(endDate)) {
    return null;
  }

  const today = new Date();
  const diffInDays = differenceInDays(endDate, today);

  let textColor = "text-muted-foreground";
  
  if (diffInDays <= 3) {
    textColor = "text-red-500 font-medium";
  } else if (diffInDays <= 7) {
    textColor = "text-orange-500 font-medium";
  } else if (diffInDays <= 14) {
    textColor = "text-yellow-600 font-medium";
  }

  return (
    <div className={textColor}>
      <span className={cn("truncate", className)}>
        {dateFormatter(value)}
      </span>
    </div>
  );
};