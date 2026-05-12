"use client";

import { TrendingUp, BarChartIcon, LayoutDashboard } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  progress: {
    label: "Progress (%)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface WorkspaceProgressChartProps {
  projects: {
    name: string;
    totalTasks?: number;
    completedTasks?: number;
    progress?: number;
  }[];
}

export const WorkspaceProgressChart = ({ projects }: WorkspaceProgressChartProps) => {
  const chartData = projects.map((project) => ({
    projectName: project.name,
    progress: project.progress || 0, 
    fill: "var(--color-progress)", 
  }));

  if (!projects || projects.length === 0) {
    return (
      <Card className="shadow-sm border-border bg-card col-span-1 xl:col-span-2 flex flex-col items-center justify-center min-h-[350px]">
        <div className="size-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <LayoutDashboard className="size-6 text-muted-foreground/70" />
        </div>
        <CardTitle className="text-lg mb-1">No Project Data</CardTitle>
        <CardDescription>Create projects and add tasks to see progress analytics.</CardDescription>
      </Card>
    );
  }

  const averageProgress = chartData.length > 0 
    ? Math.round(chartData.reduce((acc, curr) => acc + curr.progress, 0) / chartData.length)
    : 0;

  return (
    <Card className="shadow-sm border-border bg-muted/50 col-span-1 xl:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <BarChartIcon className="size-5 text-primary" />
          Projects Progress Overview
        </CardTitle>
        <CardDescription>Showing actual task completion percentage for active projects.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-h-[350px]">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, left: -10, right: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="projectName"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-xs font-medium fill-muted-foreground"
              tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-xs font-medium fill-muted-foreground"
              tickFormatter={(value) => `${value}%`} 
              domain={[0, 100]}
            />
            <ChartTooltip
              cursor={{ fill: "var(--theme-muted)", opacity: 0.2 }}
              content={<ChartTooltipContent hideLabel indicator="line" />}
            />
            <Bar 
              dataKey="progress" 
              fill="var(--color-progress)" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <div className="flex items-center gap-2 font-medium leading-none px-6 pb-6 text-sm text-muted-foreground border-t border-border/50 pt-4">
        <TrendingUp className="size-4 text-emerald-500" />
        Average workspace progress is <span className="text-foreground font-bold">{averageProgress}%</span>
      </div>
    </Card>
  );
};