"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { useSearchParams, useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const chartConfig = {
  views: {
    label: "Page Views",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type VisitorChartProps = {
  chartData: { date: string; desktop: number; mobile: number }[];
  totalDesktopVisits: number;
  totalMobileVisits: number;
};

export function VisitorChart({ chartData, totalDesktopVisits, totalMobileVisits }: VisitorChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("desktop");
  const [dateRange, setDateRange] = React.useState<"3m" | "6m" | "1y">(() => {
    const urlDateRange = searchParams.get("dateRange");
    return urlDateRange === "3m" || urlDateRange === "6m" || urlDateRange === "1y" ? urlDateRange : "3m";
  });

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("dateRange", dateRange);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [dateRange, router, searchParams]);

  const total = {
    desktop: totalDesktopVisits,
    mobile: totalMobileVisits,
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-4 border-b p-6">
        <div className="flex flex-col justify-center gap-2">
          <CardTitle>Total Visitors</CardTitle>
          <CardDescription>
            Showing total visitors for the{" "}
            {dateRange === "3m" ? "last 3 months" : dateRange === "6m" ? "last 6 months" : "last year"}
          </CardDescription>
          <Tabs
            value={dateRange}
            onValueChange={(value) => setDateRange(value as "3m" | "6m" | "1y")}
            className="w-full sm:w-[400px]"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="3m">Last 3 months</TabsTrigger>
              <TabsTrigger value="6m">Last 6 months</TabsTrigger>
              <TabsTrigger value="1y">Last year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex mt-4 sm:mt-0">
          {["desktop", "mobile"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">{chartConfig[chart].label}</span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
