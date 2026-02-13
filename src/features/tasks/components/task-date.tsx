import { differenceInDays, format } from "date-fns";
import { cn } from "@/lib/utils";

export function dateFormatter(date: Date | string | null): string { 
  if (!date) return ""; 
  const d = typeof date === "string" ? new Date(date) : date; 
  return format(d, "MMMM do, yyyy");
}

interface TaskDateProps {
  value: Date | string;
  className?: string;
}

export const TaskDate = ({ value, className }: TaskDateProps) => {
  const today = new Date();
  const endDate = new Date(value);
  const diffInDays = differenceInDays(endDate, today);

  let textColor = "text-muted-foreground";
  if (diffInDays <= 3) {
    textColor = "text-red-500";
  } else if (diffInDays <= 7) {
    textColor = "text-orange-500";
  } else if (diffInDays <= 14) {
    textColor = "text-yellow-500";
  }

  return (
    <div className={textColor}>
      <span className={cn("truncate", className)}>
        {dateFormatter(endDate)}
      </span>
    </div>
  );
};
