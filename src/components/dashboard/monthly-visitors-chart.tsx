'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { VisitData } from "@/lib/types"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

const chartConfig = {
  visitors: {
    label: "Pengunjung",
    color: "hsl(var(--primary))",
  },
}

export default function MonthlyVisitorsChart({ data }: { data: VisitData[] }) {
    const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthName = new Date(2023, i, 1).toLocaleString('default', { month: 'short' });
        const totalVisitors = data.filter(d => d.month === month).reduce((sum, item) => sum + item.totalVisitors, 0);
        return { month: monthName, totalVisitors };
    });

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <LineChart data={monthlyTotals} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickFormatter={(value) => (Number(value) / 1000).toLocaleString() + 'K'}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Line
          dataKey="totalVisitors"
          type="monotone"
          stroke="var(--color-visitors)"
          strokeWidth={2}
          dot={false}
          name="Pengunjung"
        />
      </LineChart>
    </ChartContainer>
  )
}
