"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Activity } from "lucide-react";

interface VelocityChartProps {
  title?: string;
  description?: string;
  data: {
    date: string;
    created: number;
    completed: number;
  }[];
}

const chartConfig = {
  created: { label: "New Tasks", color: "hsl(var(--muted-foreground))" },
  completed: { label: "Completed", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export const VelocityChart = ({
  title = "Daily Velocity",
  description = "New tasks vs tasks completed",
  data = []
}: VelocityChartProps) => {

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm border-border flex flex-col justify-center items-center h-[380px] text-muted-foreground">
        <Activity className="size-8 mb-2 opacity-20" />
        <p>No velocity data available.</p>
      </Card>
    )
 }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-5 text-primary" /> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} margin={{ top: 5, left: -20, right: 10, bottom: 0 }}>
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