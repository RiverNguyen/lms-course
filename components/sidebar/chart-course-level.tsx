"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
} from "@/components/ui/chart"
import { adminGetCourseLevelData } from "@/app/data/admin/admin-get-chart-data"

const chartConfig = {
  Beginner: {
    label: "Beginner",
    color: "hsl(221 83% 53%)",
  },
  Intermediate: {
    label: "Intermediate",
    color: "hsl(142 76% 36%)",
  },
  Advanced: {
    label: "Advanced",
    color: "hsl(38 92% 50%)",
  },
} satisfies ChartConfig

type ChartCourseLevelProps = {
  data: Awaited<ReturnType<typeof adminGetCourseLevelData>>
}

export function ChartCourseLevel({ data }: ChartCourseLevelProps) {
  const chartData = data.map((item) => ({
    ...item,
    fill: `var(--color-${item.level})`,
    label: chartConfig[item.level as keyof typeof chartConfig]?.label || item.level,
  }))

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Level Distribution</CardTitle>
        <CardDescription>
          Total courses: {total}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="count" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
