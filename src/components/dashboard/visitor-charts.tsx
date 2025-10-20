
'use client';

import { BarChart, LineChart } from '@tremor/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VisitData } from '@/lib/types';
import { useMemo } from 'react';

const valueFormatter = (number: number) => {
    if (number >= 1000) {
        return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toLocaleString();
};

const aggregateMonthlyData = (data: VisitData[]) => {
    return Array.from({ length: 12 }, (_, i) => {
        const monthIndex = i + 1;
        const monthName = new Date(0, i).toLocaleString('id-ID', { month: 'short' });
        
        const monthlyTotals = data
            .filter(d => d.month === monthIndex)
            .reduce((acc, current) => {
                acc.wisnus += current.wisnus || 0;
                acc.wisman += current.wisman || 0;
                return acc;
            }, { wisnus: 0, wisman: 0 });

        return { 
            month: monthName, 
            'Domestik': monthlyTotals.wisnus, 
            'Asing': monthlyTotals.wisman 
        };
    });
};


export function MonthlyLineChart({ data }: { data: VisitData[] }) {
    const chartData = useMemo(() => aggregateMonthlyData(data), [data]);
    const hasData = useMemo(() => chartData.some(d => d.Domestik > 0 || d.Asing > 0), [chartData]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tren Pengunjung Bulanan</CardTitle>
                <CardDescription>Grafik garis total pengunjung domestik dan asing per bulan.</CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                     <LineChart
                        className="h-72 mt-4"
                        data={chartData}
                        index="month"
                        categories={["Domestik", "Asing"]}
                        colors={["blue", "green"]}
                        yAxisWidth={40}
                        valueFormatter={valueFormatter}
                        showLegend={true}
                        showAnimation
                        showYAxis={true}
                        showGridLines={true}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-80">
                        <p className="text-muted-foreground">Tidak ada data untuk ditampilkan.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function MonthlyBarChart({ data }: { data: VisitData[] }) {
    const chartData = useMemo(() => aggregateMonthlyData(data), [data]);
    const hasData = useMemo(() => chartData.some(d => d.Domestik > 0 || d.Asing > 0), [chartData]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Perbandingan Pengunjung</CardTitle>
                <CardDescription>Grafik batang perbandingan pengunjung domestik vs. asing per bulan.</CardDescription>
            </CardHeader>
            <CardContent>
                 {hasData ? (
                    <BarChart
                        className="h-72 mt-4"
                        data={chartData}
                        index="month"
                        categories={['Domestik', 'Asing']}
                        colors={['blue', 'green']}
                        yAxisWidth={40}
                        valueFormatter={valueFormatter}
                        stack={false}
                        showAnimation
                        showLegend
                        showYAxis
                        showGridLines
                        showLabel={true}
                    />
                 ) : (
                    <div className="flex flex-col items-center justify-center h-80">
                        <p className="text-muted-foreground">Tidak ada data untuk ditampilkan.</p>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
