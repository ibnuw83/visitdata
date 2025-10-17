'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  wisnus: {
    label: 'Nusantara',
    color: 'hsl(var(--primary))',
  },
  wisman: {
    label: 'Mancanegara',
    color: 'hsl(var(--accent))',
  },
};

export default function VisitorBreakdownChart({ wisnus, wisman }: { wisnus: number, wisman: number }) {
  const chartData = [
    { type: 'Wisatawan', wisnus, wisman },
  ];

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="type"
          type="category"
          tickLine={false}
          axisLine={false}
          hide
        />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="wisnus" name="Nusantara" fill="var(--color-wisnus)" radius={4} />
        <Bar dataKey="wisman" name="Mancanegara" fill="var(--color-wisman)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
