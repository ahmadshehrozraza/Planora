"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string; // tailwind color e.g. "blue", "green"
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
  return (
    <Card className={cn(`flex items-center justify-between bg-${color}-50 border-${color}-200`)}>
      <CardContent className="p-3 w-full">
        <div className="flex items-center justify-between gap-2">
          <Icon className={`h-5 w-5 text-${color}-600`} />
          <p className={`text-sm font-medium text-${color}-700`}>{label}</p>
          <span className={`text-xl font-bold text-${color}-900`}>{value}</span>
        </div>
      </CardContent>
    </Card>
  );
};
