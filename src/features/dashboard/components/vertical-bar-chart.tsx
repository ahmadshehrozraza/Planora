"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
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

// 1. DUMMY DATA (5 Values)
const dummySegments = [
  { name: "Research", progress: 100, segmentStatus: "COMPLETED" },
  { name: "Planning", progress: 85, segmentStatus: "ACTIVE" },
  { name: "Design", progress: 40, segmentStatus: "ACTIVE" }, // <--- Yeh Red/Destructive show hoga (Progress < 50 & ACTIVE)
  { name: "Development", progress: 60, segmentStatus: "ACTIVE" },
  { name: "Testing", progress: 10, segmentStatus: "PLANNED" }, // <--- Yeh Primary show hoga kyunke status ACTIVE nahi hai
];

// 2. CHART CONFIGURATION
const segmentChartConfig = {
  progress: {
    label: "Progress (%)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// 3. COMPONENT
export const VerticalBarChart = () => {
  return (
    <div className="w-full bg-background">
      {/* Grid container to match your col-span logic */}
      <div className="">
        
        {/* Aapka Chart Component */}
        <Card className="shadow-sm border-border ">
          <CardHeader>
            <CardTitle>Vertcal Bar Chart</CardTitle>
            <CardDescription>Visualizing completion per phase</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={segmentChartConfig} className="h-[250px] w-full">
              <BarChart
                accessibilityLayer
                data={dummySegments}
                layout="vertical"
                margin={{ left: -10, right: 10 }}
              >
                <CartesianGrid
                  horizontal={true}
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-muted"
                />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={{ fill: "var(--theme-muted)", opacity: 0.2 }}
                  content={<ChartTooltipContent indicator="line" />}
                />

                <Bar
                  dataKey="progress"
                  fill="var(--color-progress)"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                >
                  {dummySegments.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.progress < 50 && entry.segmentStatus === "ACTIVE"
                          ? "hsl(var(--destructive))"
                          : "hsl(var(--primary))"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default VerticalBarChart;