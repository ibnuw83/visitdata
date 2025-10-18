
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Landmark, Plane, Globe } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import MonthlyVisitorsChart from "@/components/dashboard/monthly-visitors-chart";
import VisitorBreakdownChart from "@/components/dashboard/visitor-breakdown-chart";
import TopDestinationsCard from "@/components/dashboard/top-destinations-card";
import type { VisitData, Destination } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/lib/firebase/auth/use-user';
import { useFirestore } from '@/lib/firebase/client-provider';
import { useCollection } from '@/lib/firebase/firestore/use-collection';
import { collection, query, where, collectionGroup } from 'firebase/firestore';

export default function DashboardPage() {
    const { appUser } = useUser();
    const firestore = useFirestore();

    const destinationsQuery = useMemo(() => {
        if (!firestore || !appUser) return null;

        if (appUser.role === 'admin') {
            return collection(firestore, 'destinations');
        }

        if (appUser.role === 'pengelola' && appUser.assignedLocations && appUser.assignedLocations.length > 0) {
            return query(collection(firestore, 'destinations'), where('id', 'in', appUser.assignedLocations));
        }

        // Return a query that will yield no results if a manager has no assigned locations
        if (appUser.role === 'pengelola') {
            return query(collection(firestore, 'destinations'), where('id', 'in', ['non-existent-id']));
        }

        return null;
    }, [firestore, appUser]);

    const allVisitsQuery = useMemo(() => {
        if (!firestore) return null;
        return collectionGroup(firestore, 'visits');
    }, [firestore]);


    const { data: destinations, loading: destinationsLoading } = useCollection<Destination>(destinationsQuery);
    const { data: allVisitData, loading: visitsLoading } = useCollection<VisitData>(allVisitsQuery);

    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        setLoading(destinationsLoading || visitsLoading);
    }, [destinationsLoading, visitsLoading]);

    const userVisitData = useMemo(() => {
        if (!allVisitData || !appUser || !destinations) return [];

        const allowedDestinationIds = new Set(destinations.map(d => d.id));

        if (appUser.role === 'admin') {
            return allVisitData.filter(visit => allowedDestinationIds.has(visit.destinationId));
        }
        
        const assigned = appUser.assignedLocations || [];
        const assignedSet = new Set(assigned);
        
        return allVisitData.filter(visit => 
            allowedDestinationIds.has(visit.destinationId) && assignedSet.has(visit.destinationId)
        );
    }, [allVisitData, appUser, destinations]);

    const availableYears = useMemo(() => {
        if (!userVisitData) return [new Date().getFullYear()];
        const allYears = [...new Set(userVisitData.map(d => d.year))].sort((a, b) => b - a);
        const currentYear = new Date().getFullYear();
        if (!allYears.includes(currentYear)) {
            allYears.unshift(currentYear);
        }
        return allYears;
    }, [userVisitData]);

    const yearlyData = useMemo(() => {
        if (!userVisitData) return [];
        return userVisitData.filter(d => d.year === parseInt(selectedYear));
    }, [userVisitData, selectedYear]);
    
    const totalVisitors = useMemo(() => yearlyData.reduce((sum, item) => sum + item.totalVisitors, 0), [yearlyData]);
    const totalWisnus = useMemo(() => yearlyData.reduce((sum, item) => sum + item.wisnus, 0), [yearlyData]);
    const totalWisman = useMemo(() => yearlyData.reduce((sum, item) => sum + item.wisman, 0), [yearlyData]);

    const dashboardTitle = useMemo(() => {
        if (appUser?.role === 'pengelola' && destinations && destinations.length > 0) {
            const destinationNames = destinations.map(d => d.name).join(', ');
            return `Dasbor: ${destinationNames}`;
        }
        return 'Dasbor';
    }, [appUser, destinations]);

    if (loading) {
        return (
             <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-9 w-48" />
                        <Skeleton className="h-5 w-72" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                 <div className="grid gap-4 lg:grid-cols-5">
                    <Skeleton className="lg:col-span-3 h-80" />
                    <Skeleton className="lg-col-span-2 h-80" />
                </div>
                <div className="grid gap-4">
                    <Skeleton className="h-96" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">{dashboardTitle}</h1>
                    <p className="text-muted-foreground">Ringkasan data pariwisata untuk tahun {selectedYear}.</p>
                </div>
                <div className="w-full sm:w-auto">
                   <Select value={selectedYear} onValueChange={setSelectedYear} disabled={availableYears.length === 0}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableYears.map(year => (
                            <SelectItem key={year} value={year.toString()}>
                                Tahun {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Pengunjung" value={totalVisitors.toLocaleString()} icon={<Users />} className="bg-blue-600 text-white" />
                <StatCard title="Wisatawan Nusantara" value={totalWisnus.toLocaleString()} icon={<Globe />} className="bg-green-600 text-white" />
                <StatCard title="Wisatawan Mancanegara" value={totalWisman.toLocaleString()} icon={<Plane />} className="bg-orange-500 text-white" />
                <StatCard title="Total Destinasi Aktif" value={(destinations || []).filter(d => d.status === 'aktif').length.toString()} icon={<Landmark />} className="bg-purple-600 text-white"/>
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Tren Pengunjung Bulanan</CardTitle>
                        <CardDescription>Total pengunjung (domestik & asing) selama tahun {selectedYear}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MonthlyVisitorsChart data={yearlyData} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Komposisi Pengunjung</CardTitle>
                         <CardDescription>Perbandingan wisatawan nusantara dan mancanegara per bulan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VisitorBreakdownChart data={yearlyData} />
                    </CardContent>
                </Card>
            </div>
            
             <div className="grid gap-4">
                <TopDestinationsCard data={yearlyData} destinations={destinations || []} />
            </div>
        </div>
    )
}
