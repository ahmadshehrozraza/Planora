"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Layers } from "lucide-react";

interface CumulativeFlowProps {
  title?: string;
  description?: string;
  data: any[]; 
  config: ChartConfig; 
}

export const CumulativeFlow = ({
  title = "Cumulative Flow",
  description = "Task status distribution over time",
  data = [],
  config
}: CumulativeFlowProps) => {

  if (!data || data.length === 0 || !config || Object.keys(config).length === 0) {
    return (
      <Card className="shadow-sm border-border flex flex-col justify-center items-center h-[380px] text-muted-foreground">
        <Layers className="size-8 mb-2 opacity-20" />
        <p>No cumulative data available.</p>
      </Card>
    )
  }

  const statusKeys = Object.keys(config);

  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="size-5 text-primary" /> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[300px] w-full">
          <AreaChart data={data} margin={{ top: 5, left: -20, right: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />

            {statusKeys.map((key) => (
              <Area 
                key={key}
                type="monotone" 
                dataKey={key} 
                stackId="1" 
                stroke={`var(--color-${key})`} 
                fill={`var(--color-${key})`} 
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};