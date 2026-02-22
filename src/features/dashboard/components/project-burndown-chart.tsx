"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { TrendingDown } from "lucide-react";

const burndownData = [
  { day: "Day 1", ideal: 100, actual: 100 },
  { day: "Day 3", ideal: 85, actual: 90 },
  { day: "Day 5", ideal: 70, actual: 85 },
  { day: "Day 7", ideal: 55, actual: 60 },
  { day: "Day 9", ideal: 40, actual: 50 },
  { day: "Day 11", ideal: 25, actual: 30 },
  { day: "Day 14", ideal: 0, actual: 15 }, 
];

const chartConfig = {
  ideal: { label: "Ideal Trend", color: "hsl(var(--muted-foreground))" },
  actual: { label: "Actual Progress", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export const ProjectBurndownChart = () => {
  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="size-5 text-primary" /> Sprint Burndown
        </CardTitle>
        <CardDescription>Remaining effort points over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={burndownData} margin={{ top: 5, left: -20, right: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey="ideal" stroke="var(--color-ideal)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};