
'use client';

import { BarChart } from '@tremor/react';
import { VisitData } from '@/lib/types';

const valueFormatter = (number: number) => {
    if (number >= 1000) {
        return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toLocaleString();
};

export default function VisitorBreakdownChart({ data }: { data: VisitData[] }) {
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthName = new Date(2023, i, 1).toLocaleString('id-ID', { month: 'short' });
        const monthData = data.filter(d => d.month === month);
        const wisnus = monthData.reduce((sum, item) => sum + item.wisnus, 0);
        const wisman = monthData.reduce((sum, item) => sum + item.wisman, 0);
        return { month: monthName, 'Nusantara': wisnus, 'Mancanegara': wisman };
    });

  return (
     <BarChart
        className="h-72 mt-4"
        data={monthlyData}
        index="month"
        categories={['Nusantara', 'Mancanegara']}
        colors={['blue', 'green']}
        yAxisWidth={40}
        valueFormatter={valueFormatter}
        stack={false}
        showAnimation
        showLegend
        showYAxis
        showGridLines
    />
  );
}
