"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Activity } from "lucide-react";

const velocityData = [
  { date: "10 Feb", created: 12, completed: 5 },
  { date: "11 Feb", created: 3, completed: 8 },
  { date: "12 Feb", created: 5, completed: 12 },
  { date: "13 Feb", created: 2, completed: 7 },
  { date: "14 Feb", created: 8, completed: 10 },
  { date: "15 Feb", created: 0, completed: 15 },
  { date: "16 Feb", created: 4, completed: 9 },
];

const chartConfig = {
  created: { label: "New Tasks", color: "hsl(var(--muted-foreground))" },
  completed: { label: "Completed", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export const ProjectVelocityChart = () => {
  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-5 text-primary" /> Daily Velocity
        </CardTitle>
        <CardDescription>New tasks added vs tasks completed</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={velocityData} margin={{ top: 5, left: -20, right: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <ChartTooltip cursor={{ fill: "var(--theme-muted)", opacity: 0.2 }} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="created" fill="var(--color-created)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};