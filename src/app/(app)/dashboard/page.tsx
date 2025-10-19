
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, onSnapshot, Unsubscribe, Firestore } from 'firebase/firestore';

/**
 * Custom hook to fetch all visit data from multiple destinations in real-time.
 * This avoids using a collectionGroup query which can be problematic for real-time updates with 'in' filters.
 */
function useAllVisits(firestore: Firestore | null, destinationIds: string[]) {
    const [allVisitData, setAllVisitData] = useState<VisitData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || destinationIds.length === 0) {
            setLoading(false);
            setAllVisitData([]);
            return;
        }

        setLoading(true);
        const allData: { [key: string]: VisitData[] } = {};
        let initialLoadCompleted = false;
        const unsubscribers: Unsubscribe[] = [];

        destinationIds.forEach(destId => {
            const visitsRef = collection(firestore, 'destinations', destId, 'visits');
            const unsubscribe = onSnapshot(visitsRef, (snapshot) => {
                allData[destId] = snapshot.docs.map(doc => ({...doc.data(), id: doc.id} as VisitData));
                
                // Combine all data from all listeners
                const combinedData = Object.values(allData).flat();
                setAllVisitData(combinedData);
                
                // Consider loading finished after the first batch from all listeners
                if (!initialLoadCompleted && Object.keys(allData).length === destinationIds.length) {
                    setLoading(false);
                    initialLoadCompleted = true;
                }
            }, (error) => {
                console.error(`Error fetching visits for destination ${destId}:`, error);
                setLoading(false); // Stop loading on error
            });
            unsubscribers.push(unsubscribe);
        });

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [firestore, destinationIds]);

    return { data: allVisitData, loading };
}


export default function DashboardPage() {
    const { appUser } = useUser();
    const firestore = useFirestore();
    
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());

    const destinationsQuery = useMemoFirebase(() => {
        if (!firestore || !appUser) return null;

        let q = query(collection(firestore, 'destinations'), where('status', '==', 'aktif'));

        if (appUser.role === 'pengelola') {
            if (appUser.assignedLocations && appUser.assignedLocations.length > 0) {
                q = query(q, where('id', 'in', appUser.assignedLocations));
            } else {
                // Return a query that will yield no results if a manager has no assigned locations.
                return query(collection(firestore, 'destinations'), where('id', 'in', ['non-existent-id']));
            }
        }
        return q;
    }, [firestore, appUser]);

    const { data: destinations, loading: destinationsLoading } = useCollection<Destination>(destinationsQuery);
    
    const destinationIds = useMemo(() => destinations?.map(d => d.id) || [], [destinations]);

    // Use the new custom hook for fetching visits
    const { data: allVisitData, loading: visitsLoading } = useAllVisits(firestore, destinationIds);

    const loading = destinationsLoading || visitsLoading;

    const currentYear = new Date().getFullYear();
    const availableYears = useMemo(() => {
        if (!allVisitData) return [currentYear.toString()];
        const allYears = [...new Set(allVisitData.map(d => d.year.toString()))].sort((a, b) => parseInt(b) - parseInt(a));
        if (!allYears.includes(currentYear.toString())) {
            allYears.unshift(currentYear.toString());
        }
        return allYears;
    }, [allVisitData, currentYear]);

    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears, selectedYear]);

    const yearlyData = useMemo(() => {
        if (!allVisitData) return [];
        return allVisitData.filter(d => d.year === parseInt(selectedYear));
    }, [allVisitData, selectedYear]);
    
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
                            <SelectItem key={year} value={year}>
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
                <StatCard title="Total Destinasi Aktif" value={(destinations || []).length.toString()} icon={<Landmark />} className="bg-purple-600 text-white"/>
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
