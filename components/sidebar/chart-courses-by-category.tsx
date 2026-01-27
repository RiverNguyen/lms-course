"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import { adminGetCoursesByCategoryData } from "@/app/data/admin/admin-get-chart-data"

const chartConfig = {
  category: {
    label: "Category",
    color: "hsl(221 83% 53%)",
  },
} satisfies ChartConfig

type ChartCoursesByCategoryProps = {
  data: Awaited<ReturnType<typeof adminGetCoursesByCategoryData>>
}

export function ChartCoursesByCategory({ data }: ChartCoursesByCategoryProps) {
  const chartData = data.map((item) => ({
    ...item,
    fill: "var(--color-category)",
  }))

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Courses by Category</CardTitle>
        <CardDescription>
          Total courses: {total}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tickLine={false} axisLine={false} />
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
