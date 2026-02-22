"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Layers } from "lucide-react";

const cfdData = [
  { date: "Mon", done: 5, review: 2, progress: 10, todo: 30 },
  { date: "Tue", done: 8, review: 4, progress: 12, todo: 26 },
  { date: "Wed", done: 15, review: 5, progress: 8, todo: 22 },
  { date: "Thu", done: 22, review: 3, progress: 10, todo: 15 },
  { date: "Fri", done: 30, review: 6, progress: 5, todo: 9 },
  { date: "Sat", done: 35, review: 2, progress: 6, todo: 7 },
  { date: "Sun", done: 42, review: 0, progress: 4, todo: 4 },
];

const chartConfig = {
  done: { label: "Done", color: "#10b981" },
  review: { label: "In Review", color: "#a855f7" },
  progress: { label: "In Progress", color: "#3b82f6" },
  todo: { label: "To Do", color: "#f59e0b" },
} satisfies ChartConfig;

export const ProjectCumulativeFlow = () => {
  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="size-5 text-primary" /> Cumulative Flow
        </CardTitle>
        <CardDescription>Task status distribution over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={cfdData} margin={{ top: 5, left: -20, right: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area type="monotone" dataKey="done" stackId="1" stroke="var(--color-done)" fill="var(--color-done)" />
            <Area type="monotone" dataKey="review" stackId="1" stroke="var(--color-review)" fill="var(--color-review)" />
            <Area type="monotone" dataKey="progress" stackId="1" stroke="var(--color-progress)" fill="var(--color-progress)" />
            <Area type="monotone" dataKey="todo" stackId="1" stroke="var(--color-todo)" fill="var(--color-todo)" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};