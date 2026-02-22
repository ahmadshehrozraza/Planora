"use client";

import { TrendingUp, BarChartIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DummyProject } from "@/features/projects/types";

const chartConfig = {
  progress: {
    label: "Progress (%)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface WorkspaceProgressChartProps {
  projects: DummyProject[];
}

export const WorkspaceProgressChart = ({ projects }: WorkspaceProgressChartProps) => {
  const chartData = projects.map((project) => {
    const total = project.totalTasks || 0;
    const completed = project.completedTasks || 0;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      projectName: project.name,
      progress: progressPercentage,
      fill: "var(--color-progress)", 
    };
  });
  if (projects.length === 0) {
    return (
      <Card className="shadow-sm border-border bg-card">
        <CardHeader>
          <CardTitle>Workspace Progress</CardTitle>
          <CardDescription>No projects available to show progress.</CardDescription>
        </CardHeader>
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
        <CardDescription>
          Showing task completion percentage for all projects in this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-h-[350px]">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, left: -20, right: 12 }}>
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