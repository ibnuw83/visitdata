
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Landmark, Plane, Globe } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import MonthlyVisitorsChart from "@/components/dashboard/monthly-visitors-chart";
import VisitorBreakdownChart from "@/components/dashboard/visitor-breakdown-chart";
import TopDestinationsCard from "@/components/dashboard/top-destinations-card";
import { getVisitData, getDestinations } from "@/lib/local-data-service";
import type { VisitData, Destination } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
    const [visitData, setVisitData] = useState<VisitData[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setVisitData(getVisitData());
        setDestinations(getDestinations());
        setLoading(false);
    }, []);

    const year = 2023;
    const yearlyData = visitData.filter(d => d.year === year);
    
    const totalVisitors = yearlyData.reduce((sum, item) => sum + item.totalVisitors, 0);
    const totalWisnus = yearlyData.reduce((sum, item) => sum + item.wisnus, 0);
    const totalWisman = yearlyData.reduce((sum, item) => sum + item.wisman, 0);
    const totalDestinations = destinations.length;

    if (loading) {
        return (
             <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                 <div className="grid gap-4 lg:grid-cols-5">
                    <Skeleton className="lg:col-span-3 h-80" />
                    <Skeleton className="lg:col-span-2 h-80" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="lg:col-span-2 h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="font-headline text-3xl font-bold tracking-tight">Dasbor</h1>
                <p className="text-muted-foreground">Ringkasan data pariwisata untuk tahun {year}.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Pengunjung" value={totalVisitors.toLocaleString()} icon={<Users />} />
                <StatCard title="Wisatawan Nusantara" value={totalWisnus.toLocaleString()} icon={<Globe />} />
                <StatCard title="Wisatawan Mancanegara" value={totalWisman.toLocaleString()} icon={<Plane />} />
                <StatCard title="Total Destinasi" value={totalDestinations.toString()} icon={<Landmark />} />
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Tren Pengunjung Bulanan</CardTitle>
                        <CardDescription>Total pengunjung di semua destinasi selama tahun {year}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MonthlyVisitorsChart data={yearlyData} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Komposisi Pengunjung</CardTitle>
                         <CardDescription>Perbandingan antara wisatawan nusantara dan mancanegara.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VisitorBreakdownChart wisnus={totalWisnus} wisman={totalWisman} />
                    </CardContent>
                </Card>
            </div>
            
             <div className="grid gap-4">
                <TopDestinationsCard data={yearlyData} destinations={destinations} />
            </div>
        </div>
    )
}
