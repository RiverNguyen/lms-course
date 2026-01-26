"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
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
import { adminGetUserSignupsData } from "@/app/data/admin/admin-get-chart-data"

type TimeRange = "7d" | "30d" | "90d" | "1y"

const chartConfig = {
  signups: {
    label: "Signups",
    color: "hsl(221 83% 53%)",
  },
} satisfies ChartConfig

type ChartUserSignupsProps = {
  initialData: Awaited<ReturnType<typeof adminGetUserSignupsData>>
}

export function ChartUserSignups({ initialData }: ChartUserSignupsProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState<TimeRange>("90d")
  const [data, setData] = React.useState(initialData)

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

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
        <CardTitle>User Signups</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Number of user signups over time
          </span>
          <span className="@[540px]/card:hidden">Signups over time</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value as TimeRange)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 days</ToggleGroupItem>
            <ToggleGroupItem value="90d">90 days</ToggleGroupItem>
            <ToggleGroupItem value="1y">1 year</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select time range"
            >
              <SelectValue placeholder="90 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 days
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                90 days
              </SelectItem>
              <SelectItem value="1y" className="rounded-lg">
                1 year
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
                <linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-signups)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-signups)"
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
                  return date.toLocaleDateString("en-US", {
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
                    return new Date(value).toLocaleDateString("en-US", {
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
                dataKey="signups"
                type="natural"
                fill="url(#fillSignups)"
                stroke="var(--color-signups)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
      </CardContent>
    </Card>
  )
}
