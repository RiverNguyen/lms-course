"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { adminGetEnrollmentsData } from "@/app/data/admin/admin-get-chart-data"

type TimeRange = "7d" | "30d" | "90d" | "1y"

const chartConfig = {
  total: {
    label: "Tổng",
    color: "hsl(221 83% 53%)",
  },
  active: {
    label: "Đang học",
    color: "hsl(142 76% 36%)",
  },
  completed: {
    label: "Hoàn thành",
    color: "hsl(38 92% 50%)",
  },
} satisfies ChartConfig

type ChartEnrollmentsProps = {
  initialData: Awaited<ReturnType<typeof adminGetEnrollmentsData>>
}

export function ChartEnrollments({ initialData }: ChartEnrollmentsProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("7d")
  const [data, setData] = React.useState(initialData)


  // Note: For dynamic time range updates, you would need to implement API routes
  // For now, we'll filter the initial data based on timeRange

  const filteredData = React.useMemo(() => {
    if (!data.length) return []
    
    const referenceDate = new Date(data[data.length - 1]?.date || new Date())
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    } else if (timeRange === "1y") {
      daysToSubtract = 365
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    
    return data.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [data, timeRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Ghi danh khóa học</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Số lượng ghi danh khóa học theo thời gian
          </span>
          <span className="@[540px]/card:hidden">Ghi danh theo thời gian</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value as TimeRange)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="7d">7 ngày</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 ngày</ToggleGroupItem>
            <ToggleGroupItem value="90d">90 ngày</ToggleGroupItem>
            <ToggleGroupItem value="1y">1 năm</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Chọn khoảng thời gian"
            >
              <SelectValue placeholder="7 ngày" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                7 ngày
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 ngày
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                90 ngày
              </SelectItem>
              <SelectItem value="1y" className="rounded-lg">
                1 năm
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-total)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-total)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillActive" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-active)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-active)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-completed)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-completed)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("vi-VN", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("vi-VN", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="completed"
                type="natural"
                fill="url(#fillCompleted)"
                stroke="var(--color-completed)"
                stackId="a"
              />
              <Area
                dataKey="active"
                type="natural"
                fill="url(#fillActive)"
                stroke="var(--color-active)"
                stackId="a"
              />
              <Area
                dataKey="total"
                type="natural"
                fill="url(#fillTotal)"
                stroke="var(--color-total)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
      </CardContent>
    </Card>
  )
}
