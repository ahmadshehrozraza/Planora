"use client";

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

const sprintChartConfig = {
  progress: {
    label: "Progress (%)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface VerticalBarChartProps {
  data: {
    name: string;
    progress: number;
    status: string;
  }[];
}

export const VerticalBarChart = ({ data }: VerticalBarChartProps) => {
  return (
    <Card className="shadow-sm border-border print:break-inside-avoid">
      <CardHeader>
        <CardTitle className="print:text-black">Sprints Progress</CardTitle>
        <CardDescription className="print:text-black">Visualizing completion per phase</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground print:text-black">
            No sprints data available
          </div>
        ) : (
          <ChartContainer config={sprintChartConfig} className="h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={data}
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
                width={130}
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
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.progress < 50 && entry.status === "ACTIVE"
                        ? "hsl(var(--destructive))"
                        : "hsl(var(--primary))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};