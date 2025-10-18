
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { VisitData } from '@/lib/types';

const chartConfig = {
  wisnus: {
    label: 'Nusantara',
    color: 'hsl(var(--chart-1))',
  },
  wisman: {
    label: 'Mancanegara',
    color: 'hsl(var(--chart-2))',
  },
};

export default function VisitorBreakdownChart({ data }: { data: VisitData[] }) {
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthName = new Date(2023, i, 1).toLocaleString('id-ID', { month: 'short' });
        const monthData = data.filter(d => d.month === month);
        const wisnus = monthData.reduce((sum, item) => sum + item.wisnus, 0);
        const wisman = monthData.reduce((sum, item) => sum + item.wisman, 0);
        return { month: monthName, wisnus, wisman };
    });

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <BarChart data={monthlyData} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
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
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="wisnus" fill="var(--color-wisnus)" radius={4} />
        <Bar dataKey="wisman" fill="var(--color-wisman)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
