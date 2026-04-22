"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Activity } from "lucide-react";

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

interface WorkspaceActivityChartProps {
  data: {
    date: string;
    assigned: number;
    completed: number;
  }[];
}

export const WorkspaceActivityChart = ({ data }: WorkspaceActivityChartProps) => {
  const [timeRange, setTimeRange] = React.useState("7d");

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    if (timeRange === "7d") return data.slice(-7);
    if (timeRange === "30d") return data.slice(-30);
    return data; // 'all' fallback (Max 90 days from backend)
  }, [data, timeRange]);

  if (!data || data.length === 0) {
    return (
      <Card className="bg-card border-border shadow-sm col-span-1 xl:col-span-2 flex flex-col items-center justify-center min-h-[350px]">
        <div className="size-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Activity className="size-6 text-muted-foreground/70" />
        </div>
        <CardTitle className="text-lg mb-1">No Activity Data</CardTitle>
        <CardDescription>
          Task assignments and completions will appear here over time.
        </CardDescription>
      </Card>
    );
  }

  const totalDays = data.length;
  const show30DaysOption = totalDays > 7;
  const show3MonthsOption = totalDays > 30;

  return (
    <Card className="bg-card border-border shadow-sm col-span-1 xl:col-span-2">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
        <div>
          <CardTitle className="text-lg font-bold">Workspace Activity</CardTitle>
          <CardDescription>Tasks assigned vs completed over time</CardDescription>
        </div>
        
        <div className="flex items-center rounded-md border border-border bg-muted/20 p-0.5">
          {show3MonthsOption && (
            <button
              onClick={() => setTimeRange("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${
                timeRange === "all" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Last 3 months
            </button>
          )}
          
          {show30DaysOption && (
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${
                timeRange === "30d" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Last 30 days
            </button>
          )}

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
            data={filteredData}
            margin={{ left: -20, right: 12, top: 10, bottom: 0 }}
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