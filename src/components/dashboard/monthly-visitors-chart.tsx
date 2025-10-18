
'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { VisitData } from "@/lib/types"
import { Area, AreaChart, CartesianGrid, LabelList, XAxis, YAxis, Tooltip } from "recharts"

const chartConfig = {
  visitors: {
    label: "Pengunjung",
    color: "hsl(var(--primary))",
  },
}

const CustomLabel = (props: any) => {
  const { x, y, stroke, value } = props;
  if (value === 0) return null;
  const formattedValue = value > 1000 ? `${(value / 1000).toFixed(1)}K` : value;

  return <text x={x} y={y} dy={-8} fill={stroke} fontSize={12} textAnchor="middle">{formattedValue}</text>;
};


export default function MonthlyVisitorsChart({ data }: { data: VisitData[] }) {
    const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthName = new Date(2023, i, 1).toLocaleString('id-ID', { month: 'short' });
        const totalVisitors = data.filter(d => d.month === month).reduce((sum, item) => sum + item.totalVisitors, 0);
        return { month: monthName, totalVisitors };
    });

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <AreaChart data={monthlyTotals} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis
          tickFormatter={(value) => (Number(value) / 1000).toLocaleString() + 'K'}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <defs>
            <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-visitors)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-visitors)" stopOpacity={0.1}/>
            </linearGradient>
        </defs>
        <Area
          dataKey="totalVisitors"
          type="monotone"
          fill="url(#fillTotal)"
          stroke="var(--color-visitors)"
          strokeWidth={2}
          dot={true}
          name="Total Pengunjung"
        >
          <LabelList content={<CustomLabel />} />
        </Area>
      </AreaChart>
    </ChartContainer>
  )
}
