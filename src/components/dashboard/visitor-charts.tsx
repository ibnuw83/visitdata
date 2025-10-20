
'use client';

import { BarChart, LineChart } from '@tremor/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisitData } from '@/lib/types';
import { useMemo } from 'react';

const valueFormatter = (number: number) => {
    if (number >= 1000) {
        return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toLocaleString();
};


function MonthlyLineChart({ chartData }: { chartData: any[] }) {
  return (
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
    />
  );
}

function MonthlyBarChart({ chartData }: { chartData: any[] }) {
    return (
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
        />
    );
}


export default function VisitorCharts({ data }: { data: VisitData[] }) {
    const monthlyData = useMemo(() => {
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
    }, [data]);
    
    const hasData = useMemo(() => monthlyData.some(d => d.Domestik > 0 || d.Asing > 0), [monthlyData]);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Grafik Kunjungan Bulanan</CardTitle>
                <CardDescription>Visualisasi data tren dan perbandingan pengunjung.</CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <Tabs defaultValue="trend">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="trend">Tren Pengunjung</TabsTrigger>
                            <TabsTrigger value="comparison">Perbandingan</TabsTrigger>
                        </TabsList>
                        <TabsContent value="trend">
                            <MonthlyLineChart chartData={monthlyData} />
                        </TabsContent>
                        <TabsContent value="comparison">
                             <MonthlyBarChart chartData={monthlyData} />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="flex flex-col items-center justify-center h-80">
                        <p className="text-muted-foreground">Tidak ada data untuk ditampilkan pada grafik.</p>
                        <p className="text-sm text-muted-foreground">Silakan pilih tahun yang berbeda atau masukkan data.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
