"use client"

import * as React from "react"
import { Cell, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { adminGetCourseStatusData } from "@/app/data/admin/admin-get-chart-data"

const chartConfig = {
  Draft: {
    label: "Draft",
    color: "hsl(220 13% 91%)",
  },
  Published: {
    label: "Published",
    color: "hsl(142 76% 36%)",
  },
  Archived: {
    label: "Archived",
    color: "hsl(38 92% 50%)",
  },
} satisfies ChartConfig

type ChartCourseStatusProps = {
  data: Awaited<ReturnType<typeof adminGetCourseStatusData>>
}

export function ChartCourseStatus({ data }: ChartCourseStatusProps) {
  const chartData = data.map((item) => ({
    ...item,
    fill: `var(--color-${item.status})`,
  }))

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Status Distribution</CardTitle>
        <CardDescription>
          Total courses: {total}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              label={({ status, count, percent }) =>
                `${chartConfig[status as keyof typeof chartConfig]?.label || status}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-translate-y-2 flex-col gap-2 text-center sm:translate-x-0 sm:flex-row sm:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
