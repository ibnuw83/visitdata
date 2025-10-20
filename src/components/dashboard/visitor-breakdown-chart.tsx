
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
        
        // Correctly reduce the data for each month
        const totalsForMonth = data
            .filter(d => d.month === month)
            .reduce((acc, current) => {
                acc.wisnus += current.wisnus || 0;
                acc.wisman += current.wisman || 0;
                return acc;
            }, { wisnus: 0, wisman: 0 });

        return { 
            month: monthName, 
            'Nusantara': totalsForMonth.wisnus, 
            'Mancanegara': totalsForMonth.wisman 
        };
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
