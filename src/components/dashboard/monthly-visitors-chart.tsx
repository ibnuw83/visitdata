
'use client'

import { AreaChart } from "@tremor/react"
import { VisitData } from "@/lib/types"

const valueFormatter = (number: number) => {
    if (number > 1000) {
        return `${(number / 1000).toFixed(1)}K`
    }
    return number.toString();
}

export default function MonthlyVisitorsChart({ data }: { data: VisitData[] }) {
    const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthName = new Date(2023, i, 1).toLocaleString('id-ID', { month: 'short' });
        const totalVisitors = data.filter(d => d.month === month).reduce((sum, item) => sum + item.totalVisitors, 0);
        return { month: monthName, "Total Pengunjung": totalVisitors };
    });

  return (
    <AreaChart
        className="h-72 mt-4"
        data={monthlyTotals}
        index="month"
        categories={["Total Pengunjung"]}
        colors={["blue"]}
        yAxisWidth={30}
        valueFormatter={valueFormatter}
        showLegend={false}
    />
  )
}
