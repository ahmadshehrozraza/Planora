"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { TrendingDown } from "lucide-react";

interface BurndownChartProps {
  title?: string;
  description?: string;
  data: {
    day: string;
    ideal: number;
    actual: number | null;
  }[];
}

const chartConfig = {
  ideal: { label: "Ideal Trend", color: "hsl(var(--muted-foreground))" },
  actual: { label: "Actual Progress", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export const BurndownChart = ({
  title = "Sprint Burndown",
  description = "Remaining effort points over time",
  data = []
}: BurndownChartProps) => {
  
  if (!data || data.length === 0) {
     return (
       <Card className="shadow-sm border-border flex flex-col justify-center items-center h-[380px] text-muted-foreground">
         <TrendingDown className="size-8 mb-2 opacity-20" />
         <p>No burndown data available.</p>
       </Card>
     )
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="size-5 text-primary" /> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={data} margin={{ top: 5, left: -20, right: 10, bottom: 0 }}>
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