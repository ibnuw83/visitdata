
'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VisitData } from '@/lib/types';
import { useTheme } from 'next-themes';

const aggregateMonthlyData = (data: VisitData[]) => {
    const monthlyDataTemplate = Array.from({ length: 12 }, (_, i) => {
        const monthName = new Date(0, i).toLocaleString('id-ID', { month: 'short' });
        return {
            month: monthName,
            'Domestik': 0,
            'Asing': 0,
            'Total Pengunjung': 0,
        };
    });

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Bulan
            </span>
            <span className="font-bold text-muted-foreground">{label}</span>
          </div>
          {payload.map((p: any) => (
             <div key={p.dataKey} className="flex flex-col space-y-1">
               <span className="text-[0.70rem] uppercase text-muted-foreground">
                 {p.name}
               </span>
                <span className="font-bold" style={{ color: p.color }}>
                  {p.value.toLocaleString()}
                </span>
             </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const valueFormatter = (value: number) => {
    if (value === 0) return null;
    if (value > 1000) return `${(value/1000).toFixed(1)}k`;
    return value.toLocaleString();
};

export function MonthlyLineChart({ data }: { data: VisitData[] }) {
    const chartData = useMemo(() => aggregateMonthlyData(data), [data]);
    const { theme } = useTheme();
    const axisColor = theme === 'dark' ? '#888888' : '#AAAAAA';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tren Pengunjung Bulanan</CardTitle>
                <CardDescription>Grafik garis total pengunjung per bulan.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    {chartData && chartData.length > 0 ? (
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="month" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => value > 1000 ? `${value/1000}k` : value.toString()}/>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="Total Pengunjung" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                            <p className="text-muted-foreground">Tidak ada data untuk ditampilkan.</p>
                        </div>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function MonthlyBarChart({ data }: { data: VisitData[] }) {
    const chartData = useMemo(() => aggregateMonthlyData(data), [data]);
    const { theme } = useTheme();
    const axisColor = theme === 'dark' ? '#888888' : '#AAAAAA';
    const labelColor = theme === 'dark' ? '#FFFFFF' : '#333333';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Komposisi Pengunjung</CardTitle>
                <CardDescription>Perbandingan pengunjung Domestik vs. Asing.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    {chartData && chartData.length > 0 ? (
                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="month" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => value > 1000 ? `${value/1000}k` : value.toString()} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="Domestik" fill="#22c55e" radius={[4, 4, 0, 0]}>
                                <LabelList dataKey="Domestik" position="top" formatter={valueFormatter} fill={labelColor} fontSize={12} />
                            </Bar>
                            <Bar dataKey="Asing" fill="#f97316" radius={[4, 4, 0, 0]}>
                               <LabelList dataKey="Asing" position="top" formatter={valueFormatter} fill={labelColor} fontSize={12} />
                            </Bar>
                        </BarChart>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                            <p className="text-muted-foreground">Tidak ada data untuk ditampilkan.</p>
                        </div>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
