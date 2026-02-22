"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

const chartData = [
  { date: "Jun 24", assigned: 40, completed: 24 },
  { date: "Jun 25", assigned: 30, completed: 13 },
  { date: "Jun 26", assigned: 55, completed: 38 },
  { date: "Jun 27", assigned: 45, completed: 39 },
  { date: "Jun 28", assigned: 60, completed: 48 },
  { date: "Jun 29", assigned: 35, completed: 28 },
  { date: "Jun 30", assigned: 50, completed: 42 },
];

const chartConfig = {
  assigned: {
    label: "Tasks Assigned",
    color: "hsl(var(--primary))", 
  },
  completed: {
    label: "Tasks Completed",
    color: "hsl(var(--muted-foreground))", 
  },
} satisfies ChartConfig;

export const WorkspaceActivityChart = () => {
  const [timeRange, setTimeRange] = React.useState("7d");

  return (
    <Card className="bg-card border-border shadow-sm col-span-1 xl:col-span-2">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
        <div>
          <CardTitle className="text-lg font-bold">Workspace Activity</CardTitle>
          <CardDescription>Tasks assigned vs completed over time</CardDescription>
        </div>
        
        <div className="flex items-center rounded-md border border-border bg-muted/20 p-0.5">
          <button
            onClick={() => setTimeRange("3m")}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${
              timeRange === "3m" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Last 3 months
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${
              timeRange === "30d" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Last 30 days
          </button>
          <button
            onClick={() => setTimeRange("7d")}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${
              timeRange === "7d" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Last 7 days
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full mt-4">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -20,
              right: 12,
              top: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillAssigned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-assigned)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-assigned)" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
            
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              className="text-xs font-medium fill-muted-foreground"
            />
            
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-xs font-medium fill-muted-foreground"
            />

            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "4 4", fill: "transparent" }}
              content={<ChartTooltipContent indicator="dot" />}
            />

            <Area
              type="natural" 
              dataKey="assigned"
              stroke="var(--color-assigned)"
              strokeWidth={2}
              fill="url(#fillAssigned)"
              fillOpacity={1}
            />

            <Area
              type="natural"
              dataKey="completed"
              stroke="var(--color-completed)"
              strokeWidth={2}
              fill="url(#fillCompleted)"
              fillOpacity={1}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};