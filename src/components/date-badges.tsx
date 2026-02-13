import { differenceInDays, isBefore } from "date-fns";
import { Badge } from "@/components/ui/badge"; // tumhara Badge component
import { AlertTriangle, Clock, CheckCircle, Calendar } from "lucide-react";

export function StartInfo({ startDate }: { startDate: Date }) {
  const daysAgo = differenceInDays(new Date(), startDate);

  return (
    <Badge variant="secondary" icon={<Calendar size={14} />}>
      Started {daysAgo} day{daysAgo !== 1 ? "s" : ""} ago
    </Badge>
  );
}

export function EndInfo({ endDate }: { endDate: Date }) {
  const today = new Date();

  if (isBefore(endDate, today)) {
    const overdueDays = differenceInDays(today, endDate);
    return (
      <Badge variant="destructive" icon={<AlertTriangle size={14} />}>
        Overdue by {overdueDays} day{overdueDays !== 1 ? "s" : ""} 
      </Badge>
    );
  } else {
    const remainingDays = differenceInDays(endDate, today);

    // Alert color if less than or equal to 7 days left
    if (remainingDays <= 7) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800" icon={<Clock size={14} />}>
          Ends in {remainingDays} day{remainingDays !== 1 ? "s" : ""} 
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" icon={<Clock size={14} />}>
        Ends in {remainingDays} day{remainingDays !== 1 ? "s" : ""} 
      </Badge>
    );
  }
}

export function CompletionInfo({ completedDate }: { completedDate: Date }) {
  const daysAgo = differenceInDays(new Date(), completedDate);

  return (
    <Badge variant="secondary" icon={<CheckCircle size={14} />}>
      Completed {daysAgo} day{daysAgo !== 1 ? "s" : ""} ago
    </Badge>
  );
}
