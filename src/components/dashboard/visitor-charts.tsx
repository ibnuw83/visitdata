
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
    const monthlyDataTemplate = Array.from({ length: 12 }, (_, i) => {
        const monthIndex = i + 1;
        const monthName = new Date(0, i).toLocaleString('id-ID', { month: 'short' });
        return {
            month: monthName,
            'Domestik': 0,
            'Asing': 0,
            'Total Pengunjung': 0,
        };
    });

    if (!data || data.length === 0) {
        return monthlyDataTemplate;
    }

    data.forEach(visit => {
        if (visit.month >= 1 && visit.month <= 12) {
            const monthIndex = visit.month - 1;
            monthlyDataTemplate[monthIndex]['Domestik'] += visit.wisnus || 0;
            monthlyDataTemplate[monthIndex]['Asing'] += visit.wisman || 0;
            monthlyDataTemplate[monthIndex]['Total Pengunjung'] += visit.totalVisitors || 0;
        }
    });

    return monthlyDataTemplate;
};


export function MonthlyLineChart({ data }: { data: VisitData[] }) {
    const chartData = useMemo(() => aggregateMonthlyData(data), [data]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tren Pengunjung Bulanan</CardTitle>
                <CardDescription>Grafik garis total pengunjung per bulan.</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData && chartData.length > 0 ? (
                     <LineChart
                        className="h-72 mt-4"
                        data={chartData}
                        index="month"
                        categories={["Total Pengunjung"]}
                        colors={["blue"]}
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
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Komposisi Pengunjung</CardTitle>
                <CardDescription>Perbandingan pengunjung Domestik vs. Asing.</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData && chartData.length > 0 ? (
                    <BarChart
                        className="h-72 mt-4"
                        data={chartData}
                        index="month"
                        categories={["Domestik", "Asing"]}
                        colors={["green", "orange"]}
                        yAxisWidth={40}
                        valueFormatter={valueFormatter}
                        showAnimation
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
